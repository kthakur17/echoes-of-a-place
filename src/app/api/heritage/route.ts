import { type NextRequest, NextResponse } from "next/server";
import { guardRequest } from "@/lib/guard";
import { toErrorResponse } from "@/lib/apiError";
import { heritageRequestSchema } from "@/lib/validation/requests";
import { heritageResponseSchema } from "@/lib/validation/responses";
import { buildHeritagePrompt, HERITAGE_SYSTEM } from "@/lib/gemini/prompts/heritage";
import { generateStructured } from "@/lib/gemini/client";
import { recordJourneyEntry } from "@/lib/journey/server";

export const runtime = "nodejs";

/** Feature 5: Hidden Heritage Explorer. */
export async function POST(req: NextRequest) {
  try {
    const user = await guardRequest(req);
    const input = heritageRequestSchema.parse(await req.json());

    const result = await generateStructured({
      prompt: buildHeritagePrompt(input),
      schema: heritageResponseSchema,
      systemInstruction: HERITAGE_SYSTEM,
      temperature: 0.7,
    });

    await recordJourneyEntry(user.uid, {
      type: "heritage",
      destination: input.destination,
      summary: `Explored hidden heritage of ${input.destination}: ${result.items
        .slice(0, 3)
        .map((i) => i.name)
        .join(", ")}${result.items.length > 3 ? " and more" : ""}.`,
    });

    return NextResponse.json({ data: { destination: input.destination, items: result.items } });
  } catch (err) {
    return toErrorResponse(err);
  }
}
