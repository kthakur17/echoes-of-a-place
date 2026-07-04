import { type NextRequest, NextResponse } from "next/server";
import { guardRequest } from "@/lib/guard";
import { toErrorResponse } from "@/lib/apiError";
import { eventsRequestSchema } from "@/lib/validation/requests";
import { eventsResponseSchema } from "@/lib/validation/responses";
import { buildEventsPrompt, EVENTS_SYSTEM } from "@/lib/gemini/prompts/events";
import { generateStructured } from "@/lib/gemini/client";
import { recordJourneyEntry } from "@/lib/journey/server";

export const runtime = "nodejs";

/** Feature 6: Cultural Events Discovery. */
export async function POST(req: NextRequest) {
  try {
    const user = await guardRequest(req);
    const input = eventsRequestSchema.parse(await req.json());

    const result = await generateStructured({
      prompt: buildEventsPrompt(input),
      schema: eventsResponseSchema,
      systemInstruction: EVENTS_SYSTEM,
      temperature: 0.7,
    });

    await recordJourneyEntry(user.uid, {
      type: "events",
      destination: input.destination,
      summary: `Looked into cultural events in ${input.destination} for ${input.startDate} to ${input.endDate}, including ${result.events
        .slice(0, 2)
        .map((e) => e.name)
        .join(" and ")}.`,
    });

    return NextResponse.json({ data: { destination: input.destination, events: result.events } });
  } catch (err) {
    return toErrorResponse(err);
  }
}
