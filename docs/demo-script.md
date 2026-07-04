# Demo Script — "This is not another travel planner"

**Duration:** ~8 minutes · **Setup:** production URL open, signed out, Firestore console in a second tab.

---

## Opening (30s)

> "Every travel platform answers the same question: *where should I go?* We built one that answers a better question: *why does this place matter?* This is Echoes of a Place — tourists visit places; we help them have conversations with history. Everything you're about to see is generated live by Gemini — there is not one hardcoded response in this product."

Land on `/`. Point at the tagline. Click **Begin your journey** → the sign-in gate appears → **Continue with Google**.

> "Firebase Auth — Google or one-click guest. Every API call from here carries a verified identity token; our Gemini key is never exposed and never usable anonymously."

## Feature 1 — Discovery that starts with a feeling (90s)

On `/discover`: select **Spirituality** + **Markets & street life**, budget *Moderate*, style *Slow & immersive*, 7 days, and type the emotional goal: **"hidden gems instead of crowds"**.

> "Notice what we're NOT asking: a city name. We're asking what you're longing for."

Submit. While skeletons shimmer: "Real Gemini call — input validated, rate-limited, prompt-injection-fenced."

When cards land, read one `whyItMatters` aloud:

> "It doesn't say 'popular destination'. It argues — in *my* words — why this place answers *my* goal. And every card has hidden gems and things to do *with local people*, not just monuments."

Click **Hear its story →** on your favorite. *(The destination now follows us across every feature.)*

## Feature 2 — The Story Engine, live (60s)

`/stories` arrives pre-filled. Click **Tell me the story** and **stay silent for ten seconds** while the narration streams in word by word.

> "This is the moment we stop being a planner. That's a documentary narrator writing this place's history, legends, and living traditions — streamed live, second person, honest about what's legend versus record."

## Feature 3 — Time Portal (60s)

`/time-portal` → **Open the portal** → click **100 Years Ago**, read the scene-setting line, then **Ancient Era**.

> "Same street, four centuries. Daily life, major events, the environment — and every era ends with *what survives today*, so when you stand there you know what you're looking at. Notice it says 'c. 6th century' and flags what's archaeology versus tradition — we prompt for honesty, not confidence."

Click back to a loaded era — instant. "Cached per destination; we don't re-spend tokens."

## Feature 4 — Talk to the place (75s)

`/companions` → pick **Auntie Lan 🍜**. Ask: **"What should I eat first, and where do locals actually go?"** Then follow up: **"How do I eat it politely?"**

> "Five personas — artisan, historian, storyteller, musician, food vendor — each a character sheet grounded in this destination, with full conversation memory. Watch her recommend market lanes, not tourist restaurants."

*(If a judge is game, let them ask the historian anything.)*

## Feature 5 — Heritage with a conscience (60s)

`/heritage` → **Explore hidden heritage**. Point at an **ENDANGERED** badge.

> "This is the feature we care most about. Not what to see — what's *disappearing*: who still practices it, why it's dying, and concrete, ethical ways a visitor helps it survive. Tourism as preservation instead of erosion."

## Feature 6 — Arrive when it's alive (45s)

`/events` → pick dates ~1 month out → **Find what's alive**.

> "Festivals and gatherings for *my* dates — with significance and visitor etiquette. And look at the timing field: for lunar-calendar festivals it tells you dates move and to verify — the AI is engineered to be honest about what it can't know."

## Feature 7 — The Storybook payoff (75s)

`/storybook`.

> "Here's the thread you didn't see: everything we just did was being recorded." — scroll the journey log: the discovery, the story, both eras, Auntie Lan, heritage, events — timestamped, in Firestore, under my user only.

Type your name → **Write my storybook**. Read the title and a chapter opening aloud.

> "This memoir is compiled from my *real* session — the prompt receives my actual journey log and is forbidden from inventing visits. If my journey were empty, the API refuses with a 409. It's saved to Firestore — my journey, permanently mine."

## Close (30s)

Flip briefly to the Firestore console: `journeyEntries` + the new `storybooks` doc.

> "Seven features, one system: server-side Gemini with schema-validated output and corrective retries, Firebase Auth on every endpoint, deny-by-default Firestore rules, rate limiting, sanitized and fenced inputs, 47 automated tests, WCAG-conscious UI with streaming, skeletons, and honest error states. Not another travel planner — a conversation with history."

---

## Contingencies

- **Slow generation:** narrate the architecture (auth → validation → prompt → schema check → journey record). Skeletons and streaming mean the screen is never blank.
- **A 429:** "That's the rate limiter doing its job" — switch to a pre-generated storybook under *Earlier storybooks*.
- **Popup blocked:** use **Explore as a guest** — full product works; the memoir just says "A Traveler".
