# User Flows

## Flow 0 — First Visit & Sign-In

```
Landing page (/)
  → "Begin your journey" → /discover
  → AuthGate: not signed in → sign-in card
      → "Continue with Google"  (Firebase popup)
      → "Explore as a guest"    (Firebase anonymous auth — one click)
  → signed in → feature UI renders
```

Guests get the full experience (their uid still scopes journey data); signing in with Google later simply gives the storybook a real name.

## Flow 1 — AI Destination Discovery

```
/discover
  → pick interest chips (≥1) → budget / travel style / days slider
  → type emotional goal ("peaceful spiritual weekend")
  → "Find places that answer"
  → skeleton cards + aria-live "finding destinations…"
  → 3 destination cards: why-it-matters reasoning, matched desires,
    attractions / hidden gems / local experiences, budget + season
  → per card: [Hear its story →] [Open the time portal] [Meet its people]
      → clicking sets the shared destination context and navigates
  ✎ journeyEntries += discovery
```

**Error path:** API failure → dismissable banner with "Try again" (inputs preserved).

## Flow 2 — Cultural Story Engine

```
/stories (destination pre-filled if arriving from Discover)
  → choose focus (whole tapestry / history / legends / traditions / folklore)
  → "Tell me the story"
  → narration STREAMS live into the page, cursor blinking,
    headings and paragraphs forming as Gemini writes
  ✎ journeyEntries += story
```

**Empty state:** "The storyteller is waiting" with example places.
**Error path:** stream interruption → banner + retry; abort handled silently on re-request.

## Flow 3 — Time Portal

```
/time-portal
  → destination → "Open the portal"
  → era tabs: [🌆 Present] [📻 50 Years Ago] [🎩 100 Years Ago] [🏺 Ancient]
  → each era loads once per destination (cached in state) — switching back is instant
  → era portrait: scene-setting narration, daily life, cultural practices,
    major events timeline, environment, "what survives today" bridge
  ✎ journeyEntries += time-portal (per era visited)
```

## Flow 4 — Cultural Companions

```
/companions
  → destination → choose one of 5 persona cards
  → chat opens with the persona's greeting
  → user asks → "Meera is thinking…" → in-character reply (full history sent
    each turn, capped at 30 messages)
  → changing persona or destination starts a fresh conversation
  ✎ journeyEntries += companion-chat (first message of each conversation only)
```

**Error path:** failed send restores the draft into the input and rolls back history.

## Flow 5 — Hidden Heritage Explorer

```
/heritage
  → destination → "Explore hidden heritage"
  → 4-6 heritage cards, each with urgency badge
    (stable / declining / endangered / critically-endangered),
    story, why it matters, why it's disappearing,
    "How you can help" action list, where to experience it
  ✎ journeyEntries += heritage
```

## Flow 6 — Cultural Events Discovery

```
/events
  → destination + From/To date pickers (≤ 90-day window, end ≥ start)
  → "Find what's alive"
  → event cards: name, timing (honest about lunar/movable dates),
    significance, what locals do, visitor etiquette
  ✎ journeyEntries += events
```

## Flow 7 — AI Journey Storybook

```
/storybook
  → "Your journey so far": chronological log of every recorded exploration
      (empty → invitation card linking to /discover)
  → optional traveler name → "Write my storybook"
  → Gemini compiles ONLY the real journey log into a memoir
      (server returns 409 empty_journey if the log is empty)
  → book view: title page, dedication, numbered chapters, epilogue
  → memoir saved to Firestore → appears under "Earlier storybooks" forever
```

## The Golden Path (demo journey)

Discover ("hidden gems instead of crowds") → pick recommendation → Hear its story →
Time portal (2 eras) → Chat with the food vendor → Heritage → Events for next month →
Storybook: a memoir that references every one of those steps by name.
