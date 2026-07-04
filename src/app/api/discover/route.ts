import { type NextRequest, NextResponse } from "next/server";
import { guardRequest } from "@/lib/guard";
import { toErrorResponse } from "@/lib/apiError";
import { discoveryRequestSchema } from "@/lib/validation/requests";
import { discoveryResponseSchema } from "@/lib/validation/responses";
import { buildDiscoveryPrompt, DISCOVERY_SYSTEM } from "@/lib/gemini/prompts/discovery";
import { generateStructured } from "@/lib/gemini/client";
import { recordJourneyEntry } from "@/lib/journey/server";

export const runtime = "nodejs";

/** Feature 1: AI Destination Discovery. */
export async function POST(req: NextRequest) {
  try {
    const user = await guardRequest(req);
    const input = discoveryRequestSchema.parse(await req.json());

    const result = await generateStructured({
      prompt: buildDiscoveryPrompt(input),
      schema: discoveryResponseSchema,
      systemInstruction: DISCOVERY_SYSTEM,
    });

    await recordJourneyEntry(user.uid, {
      type: "discovery",
      destination: result.destinations.map((d) => d.name).join(", "),
      summary: `Searched for "${input.emotionalGoal}" (${input.travelStyle}, ${input.durationDays} days) and discovered ${result.destinations
        .map((d) => `${d.name}, ${d.country}`)
        .join("; ")}.`,
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    return toErrorResponse(err);
  }
}
