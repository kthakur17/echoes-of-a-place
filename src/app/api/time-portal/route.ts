import { type NextRequest, NextResponse } from "next/server";
import { guardRequest } from "@/lib/guard";
import { toErrorResponse } from "@/lib/apiError";
import { timePortalRequestSchema } from "@/lib/validation/requests";
import { eraPortraitSchema } from "@/lib/validation/responses";
import { buildTimePortalPrompt, TIME_PORTAL_SYSTEM } from "@/lib/gemini/prompts/timePortal";
import { generateStructured } from "@/lib/gemini/client";
import { recordJourneyEntry } from "@/lib/journey/server";
import { ERA_LABELS } from "@/types";

export const runtime = "nodejs";

/** Feature 3: Time Portal Experience — one era per call. */
export async function POST(req: NextRequest) {
  try {
    const user = await guardRequest(req);
    const input = timePortalRequestSchema.parse(await req.json());

    const result = await generateStructured({
      prompt: buildTimePortalPrompt(input),
      schema: eraPortraitSchema,
      systemInstruction: TIME_PORTAL_SYSTEM,
      temperature: 0.7,
    });

    await recordJourneyEntry(user.uid, {
      type: "time-portal",
      destination: input.destination,
      summary: `Stepped into ${input.destination} in the era "${ERA_LABELS[input.era]}" (${result.approximatePeriod}).`,
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    return toErrorResponse(err);
  }
}
