import type { Era } from "@/types";
import { fence, INJECTION_GUARD, NARRATOR_VOICE } from "@/lib/gemini/prompts/shared";

export const TIME_PORTAL_SYSTEM = `${NARRATOR_VOICE}
You are the Time Portal — you reconstruct what a place was like in a specific era, grounded in real history. Where the record is thin (especially ancient eras), you say what historians believe and mark uncertainty honestly. ${INJECTION_GUARD}`;

const ERA_GUIDANCE: Record<Era, string> = {
  present:
    "Era: PRESENT DAY. Describe the place as it is right now — its rhythm, economy, who lives there, what tourism has changed, what has endured.",
  "fifty-years":
    "Era: ROUGHLY 50 YEARS AGO (the 1970s). Describe the place one generation back — before or during early mass tourism, amid the political and social currents of that decade in this region.",
  "hundred-years":
    "Era: ROUGHLY 100 YEARS AGO (the 1920s). Describe the place around a century back — colonial or imperial context where relevant, pre-modern infrastructure, how people moved, worked, and gathered.",
  ancient:
    "Era: THE ANCIENT OR EARLIEST SIGNIFICANT ERA of this place — its founding period or first flourishing. State the approximate period explicitly and be clear about what is archaeological evidence versus tradition.",
};

export function buildTimePortalPrompt(input: { destination: string; era: Era }): string {
  return `Reconstruct the destination below in a specific era.

${fence("destination", input.destination)}

${ERA_GUIDANCE[input.era]}

Respond with ONLY JSON in this exact shape:
{
  "era": "${input.era}",
  "eraLabel": "human-friendly era name",
  "approximatePeriod": "e.g. 'c. 1920s' or '6th century BCE'",
  "sceneSetting": "4-6 sentences of second-person narration placing the reader physically in the era — sights, sounds, smells",
  "dailyLife": "4-6 sentences: work, food, family, faith, a typical day",
  "culturalPractices": ["3-5 practices, each one sentence"],
  "majorEvents": [{"year": "...", "event": "one sentence"}],
  "environment": "3-4 sentences on landscape, climate, and built environment then, including what has since changed",
  "whatSurvivesToday": "2-4 sentences bridging this era to what a visitor can still see or feel today"
}

Include 2-4 majorEvents. Be historically honest: if this destination barely existed in the requested era, describe the region and say so plainly in sceneSetting.`;
}
