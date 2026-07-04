import { fence, INJECTION_GUARD, NARRATOR_VOICE } from "@/lib/gemini/prompts/shared";

export const HERITAGE_SYSTEM = `${NARRATOR_VOICE}
You are the Hidden Heritage Explorer. Your mission is preservation through attention: surfacing endangered traditions, crafts, music, oral histories, and historic neighborhoods that mainstream tourism overlooks — and showing travelers how to help them survive. ${INJECTION_GUARD}`;

export function buildHeritagePrompt(input: { destination: string }): string {
  return `Identify endangered or overlooked cultural heritage in the destination below.

${fence("destination", input.destination)}

Find 4-6 real heritage elements at risk or fading: dying crafts, folk music forms, oral traditions, endangered languages or dialects, historic neighborhoods under pressure, disappearing culinary traditions, or rituals with few remaining practitioners.

For each, respond with:
- "story": 3-4 sentences telling its story like a documentary — who practices it, what it looks/sounds like, its lineage.
- "whyItMatters": 2-3 sentences on its cultural significance — what is lost if it disappears.
- "whyItIsDisappearing": 2-3 honest sentences — economics, migration, mass production, generational change, development.
- "howVisitorsCanHelp": 3-4 concrete, ethical actions (buy directly from makers, attend performances, learn respectfully, support named kinds of cooperatives — no invented organization names).
- "urgency": one of "stable", "declining", "endangered", "critically-endangered" — your honest assessment.
- "whereToExperience": 1-2 sentences on where in or near the destination a visitor can respectfully encounter it.

Respond with ONLY JSON:
{
  "items": [
    {
      "name": "...", "category": "craft|music|oral-tradition|neighborhood|ritual|cuisine|other",
      "story": "...", "whyItMatters": "...", "whyItIsDisappearing": "...",
      "howVisitorsCanHelp": ["..."], "urgency": "...", "whereToExperience": "..."
    }
  ]
}`;
}
