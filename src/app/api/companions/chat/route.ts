import { type NextRequest, NextResponse } from "next/server";
import { guardRequest } from "@/lib/guard";
import { toErrorResponse } from "@/lib/apiError";
import { companionChatRequestSchema } from "@/lib/validation/requests";
import { buildCompanionSystem } from "@/lib/gemini/prompts/companions";
import { generateChatReply } from "@/lib/gemini/client";
import { recordJourneyEntry } from "@/lib/journey/server";
import { PERSONAS } from "@/lib/personas";

export const runtime = "nodejs";

/** Feature 4: Cultural Companion Personas — multi-turn, in-character chat. */
export async function POST(req: NextRequest) {
  try {
    const user = await guardRequest(req, 30); // chat is bursty; allow a higher per-minute budget
    const input = companionChatRequestSchema.parse(await req.json());

    const reply = await generateChatReply({
      systemInstruction: buildCompanionSystem(input.personaId, input.destination),
      history: input.history,
      message: input.message,
    });

    // Record once per conversation, not per message, to keep the journey log meaningful.
    if (input.history.length === 0) {
      const persona = PERSONAS[input.personaId];
      await recordJourneyEntry(user.uid, {
        type: "companion-chat",
        destination: input.destination,
        summary: `Struck up a conversation with ${persona.name}, ${persona.title}, in ${input.destination} — opening with: "${input.message.slice(0, 120)}".`,
      });
    }

    return NextResponse.json({ data: { reply } });
  } catch (err) {
    return toErrorResponse(err);
  }
}
