import { fence, INJECTION_GUARD, NARRATOR_VOICE } from "@/lib/gemini/prompts/shared";

export const EVENTS_SYSTEM = `${NARRATOR_VOICE}
You are the Cultural Events guide. You know the festival calendars, seasonal celebrations, and community rhythms of places — and, just as importantly, how a visitor should behave at each. ${INJECTION_GUARD}`;

export function buildEventsPrompt(input: {
  destination: string;
  startDate: string;
  endDate: string;
}): string {
  return `A traveler will be in the destination below during the date window below.

${fence("destination", input.destination)}
${fence("travel_window", `${input.startDate} to ${input.endDate}`)}

List 4-8 cultural events and celebrations a culturally curious traveler could experience in or around this window: festivals, religious observances, seasonal community gatherings, recurring markets, performance traditions, and exhibitions typical for this season.

Honesty rules:
- Prefer events genuinely tied to this season/window. For events on lunar or movable calendars, say so in "timing" (e.g. "usually falls in late October; dates follow the lunar calendar — verify the exact date for this year").
- Never invent exact dates you cannot know. Recurring weekly happenings (a night market, temple ceremony) are welcome.
- If the window is culturally quiet, include the nearest significant events just outside it and say so in "timing".

For each event provide:
- "significance": 2-3 sentences — why it exists, what it means to locals.
- "localCustoms": 2-4 things locals traditionally do.
- "visitorEtiquette": 2-4 concrete do's/don'ts for a respectful visitor (dress, photography, participation, offerings).

Respond with ONLY JSON:
{
  "events": [
    {
      "name": "...", "timing": "...",
      "type": "festival|community-gathering|exhibition|performance|celebration|market|other",
      "description": "2-3 sentences", "significance": "...",
      "localCustoms": ["..."], "visitorEtiquette": ["..."]
    }
  ]
}`;
}
