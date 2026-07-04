import { type NextRequest, NextResponse } from "next/server";
import { guardRequest } from "@/lib/guard";
import { ApiError, toErrorResponse } from "@/lib/apiError";
import { storybookRequestSchema } from "@/lib/validation/requests";
import { storybookResponseSchema } from "@/lib/validation/responses";
import { buildStorybookPrompt, STORYBOOK_SYSTEM } from "@/lib/gemini/prompts/storybook";
import { generateStructured } from "@/lib/gemini/client";
import { listJourneyEntries, listStorybooks, saveStorybook } from "@/lib/journey/server";

export const runtime = "nodejs";

/**
 * Feature 7: AI Journey Storybook.
 * POST compiles the user's real journey entries into a memoir and saves it;
 * GET lists previously generated storybooks.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await guardRequest(req, 5); // memoir generation is expensive — tight limit
    const input = storybookRequestSchema.parse(await req.json());

    const entries = await listJourneyEntries(user.uid);
    if (entries.length === 0) {
      throw new ApiError(
        409,
        "empty_journey",
        "Your journey is still unwritten — explore a destination, story, or era first, then come back for your storybook.",
      );
    }

    const travelerName = input.travelerName ?? user.name ?? "A Traveler";
    const memoir = await generateStructured({
      prompt: buildStorybookPrompt({ travelerName, entries }),
      schema: storybookResponseSchema,
      systemInstruction: STORYBOOK_SYSTEM,
    });

    const saved = await saveStorybook(user.uid, { ...memoir, createdAt: Date.now() });
    return NextResponse.json({ data: saved });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await guardRequest(req, 30);
    const storybooks = await listStorybooks(user.uid);
    return NextResponse.json({ data: { storybooks } });
  } catch (err) {
    return toErrorResponse(err);
  }
}
