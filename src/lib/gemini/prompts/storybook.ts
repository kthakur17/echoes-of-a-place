import type { JourneyEntry } from "@/types";
import { fence, INJECTION_GUARD, NARRATOR_VOICE } from "@/lib/gemini/prompts/shared";

export const STORYBOOK_SYSTEM = `${NARRATOR_VOICE}
You are the Journey Storybook writer. You turn a traveler's real exploration history on this platform into a personal travel memoir — professionally written, intimate, and specific to what THEY explored. ${INJECTION_GUARD}`;

const TYPE_LABELS: Record<JourneyEntry["type"], string> = {
  discovery: "discovered destinations",
  story: "listened to the story of",
  "time-portal": "traveled through time in",
  "companion-chat": "talked with a local companion in",
  heritage: "explored hidden heritage of",
  events: "looked into cultural events of",
};

export function buildStorybookPrompt(input: {
  travelerName: string;
  entries: JourneyEntry[];
}): string {
  const journeyLog = input.entries
    .map((e, i) => {
      const when = new Date(e.createdAt).toISOString().slice(0, 10);
      return `${i + 1}. [${when}] ${TYPE_LABELS[e.type]} ${e.destination} — ${e.summary}`;
    })
    .join("\n");

  return `Write a personal travel memoir for the traveler below, compiled from their REAL exploration history on this platform (chronological):

${fence("traveler_name", input.travelerName)}
${fence("journey_log", journeyLog)}

Requirements:
- "title": evocative and personal, e.g. "${input.travelerName}'s Journey Through Living History" — but specific to the places actually in the log.
- "dedication": 1-2 sentences, second person, about what kind of traveler the log reveals them to be.
- "chapters": one chapter per destination or major theme in the log (3-8 chapters). Each chapter:
  - "heading": evocative phrase naming the place.
  - "body": 150-250 words in warm documentary prose, second person ("You began in..."), weaving in the specific stories, eras, companions, heritage, and events from the log entries for that place. Reference what they actually explored — do not invent visits that are not in the log.
- "epilogue": 80-120 words on the thread connecting their journey — what kind of conversation with history they have been having, and an invitation to continue it.

Respond with ONLY JSON:
{
  "title": "...",
  "dedication": "...",
  "chapters": [{"heading": "...", "body": "..."}],
  "epilogue": "..."
}`;
}
