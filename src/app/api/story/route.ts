import { type NextRequest } from "next/server";
import { guardRequest } from "@/lib/guard";
import { toErrorResponse } from "@/lib/apiError";
import { storyRequestSchema } from "@/lib/validation/requests";
import { buildStoryPrompt, STORY_SYSTEM } from "@/lib/gemini/prompts/story";
import { generateNarrationStream } from "@/lib/gemini/client";
import { recordJourneyEntry } from "@/lib/journey/server";

export const runtime = "nodejs";

/**
 * Feature 2: Cultural Story Engine.
 * Streams Markdown narration as text/plain so the story unfolds on screen
 * the way a narrator would speak it.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await guardRequest(req);
    const input = storyRequestSchema.parse(await req.json());

    const stream = await generateNarrationStream({
      prompt: buildStoryPrompt(input),
      systemInstruction: STORY_SYSTEM,
    });

    // Record the journey entry only when the narration finishes streaming —
    // an aborted or failed story must not become a "fact" in the memoir.
    const journeyRecorder = new TransformStream<Uint8Array, Uint8Array>({
      async flush() {
        await recordJourneyEntry(user.uid, {
          type: "story",
          destination: input.destination,
          summary: `Listened to the cultural story of ${input.destination} (focus: ${input.focus}).`,
        });
      },
    });

    return new Response(stream.pipeThrough(journeyRecorder), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
