import type { DiscoveryRequest } from "@/types";
import { fence, INJECTION_GUARD, NARRATOR_VOICE } from "@/lib/gemini/prompts/shared";

export const DISCOVERY_SYSTEM = `${NARRATOR_VOICE}
You are the destination-discovery guide. Your job is not "where should I go?" but "why does this place matter — for this specific traveler?".
Prefer culturally rich, less-crowded places over obvious tourist checklists whenever the traveler's goals allow it. ${INJECTION_GUARD}`;

export function buildDiscoveryPrompt(input: DiscoveryRequest): string {
  const {
    interests,
    budget,
    durationDays,
    travelStyle,
    emotionalGoal,
    homeRegion,
  } = input;

  return `A traveler is looking for destinations that answer a feeling, not just a location. Their profile:

${fence("interests", interests.join(", "))}
${fence("budget", budget)}
${fence("trip_length_days", String(durationDays))}
${fence("travel_style", travelStyle)}
${fence("emotional_goal", emotionalGoal)}
${homeRegion ? fence("traveling_from", homeRegion) : ""}

Recommend exactly 3 destinations that genuinely fit this profile. For each one:
- "whyItMatters" must explain, in 3-5 evocative sentences, why this place answers THIS traveler's emotional goal — reference their words.
- "matchedDesires" lists 2-4 short phrases connecting the place back to their stated interests and goal.
- "attractions" are 3 essential places, each with a one-sentence note on its cultural meaning (not logistics).
- "hiddenGems" are 3 places most tourists miss — neighborhoods, workshops, viewpoints, small temples, family-run spots.
- "localExperiences" are 3 things to DO with local people — classes, ceremonies, markets, shared meals.
- "dailyBudgetEstimate" is a realistic daily range in USD for their stated budget tier, phrased like "$40-60/day".
- "bestTimeToVisit" names months and why (weather, festivals, crowds).

Diversity rule: the 3 destinations must be in different countries or very distinct regions, and at least one must be a place unlikely to appear on mainstream "top 10" lists.

Respond with ONLY JSON in this exact shape:
{
  "destinations": [
    {
      "name": "...", "country": "...", "region": "...", "tagline": "...",
      "whyItMatters": "...", "matchedDesires": ["..."],
      "attractions": [{"name": "...", "note": "..."}],
      "hiddenGems": [{"name": "...", "note": "..."}],
      "localExperiences": [{"name": "...", "note": "..."}],
      "bestTimeToVisit": "...", "dailyBudgetEstimate": "..."
    }
  ]
}`;
}
