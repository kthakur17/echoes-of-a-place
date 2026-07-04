import type { StoryRequest } from "@/types";
import { fence, INJECTION_GUARD, NARRATOR_VOICE } from "@/lib/gemini/prompts/shared";

export const STORY_SYSTEM = `${NARRATOR_VOICE}
You are the Cultural Story Engine. You do NOT write encyclopedia entries or listicles.
You write immersive second-person narration — the reader should feel they are standing in the place while a master documentary narrator speaks beside them. ${INJECTION_GUARD}`;

const FOCUS_GUIDANCE: Record<NonNullable<StoryRequest["focus"]>, string> = {
  history: "Center the narrative on the sweep of history — origins, golden ages, invasions, reinventions.",
  legends: "Center the narrative on legends and myths — tell them as stories, then reveal what they mean to locals.",
  traditions: "Center the narrative on living traditions — rituals, crafts, festivals, daily customs still practiced today.",
  folklore: "Center the narrative on folklore — the tales grandparents tell, local spirits, songs, and superstitions.",
  all: "Weave history, legend, tradition, and folklore into one flowing narrative.",
};

export function buildStoryPrompt(input: { destination: string; focus: NonNullable<StoryRequest["focus"]> }): string {
  return `Write an immersive cultural story about the destination below.

${fence("destination", input.destination)}

${FOCUS_GUIDANCE[input.focus]}

Structure (write in Markdown):
1. Open with a cinematic scene in the present — put the reader physically there ("Imagine standing..."). No heading for the opening.
2. Then 3-4 sections, each with a short evocative "## " heading (a phrase, not a label like "History").
3. Along the way, include: at least one true historical turning point, one legend or piece of folklore (clearly framed as such), one living tradition a visitor can still witness, and one ordinary local person's perspective (a vendor, a boatman, a grandmother — archetypal, not a fabricated named real person).
4. Close with a single short paragraph that lands why this place still matters — the echo the traveler will carry home.

Rules:
- 600-900 words total. Sensory and specific: name real streets, rivers, dishes, materials, sounds.
- Never invent verifiable specifics (prices, dates you are unsure of, named living individuals).
- If the destination is ambiguous or fictional, say so in one sentence and write about the closest real place instead.`;
}
