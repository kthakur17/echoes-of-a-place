# API Specification

All endpoints are Next.js API routes under `/api`. Conventions:

- **Auth:** every request requires `Authorization: Bearer <Firebase ID token>`. Missing/invalid → `401 unauthorized`.
- **Envelope:** success → `{ "data": ... }`; failure → `{ "error": { "code": string, "message": string } }`.
- **Common errors:** `400 invalid_request` (Zod validation, field detail in message), `401 unauthorized`, `429 rate_limited`, `502 upstream_ai_error` (Gemini failure — safe message, details logged server-side), `500 internal`.
- **Rate limits (per user, per minute):** 15 default · 30 chat · 5 storybook.

---

## POST `/api/discover` — Feature 1

Request:
```json
{
  "interests": ["History", "Food & cuisine"],
  "budget": "moderate",
  "durationDays": 7,
  "travelStyle": "slow-immersive",
  "emotionalGoal": "a peaceful spiritual weekend",
  "homeRegion": "India"
}
```
Constraints: `interests` 1–10 items (2–40 chars each) · `budget` ∈ shoestring/moderate/comfortable/luxury · `durationDays` 1–60 · `travelStyle` ∈ slow-immersive/adventurous/family/solo-reflective/social · `emotionalGoal` 3–300 chars · `homeRegion` optional.

Response `200`:
```json
{
  "data": {
    "destinations": [
      {
        "name": "Luang Prabang",
        "country": "Laos",
        "region": "Northern Laos",
        "tagline": "Where monks still own the morning",
        "whyItMatters": "You asked for peace without performance…",
        "matchedDesires": ["quiet spirituality", "unhurried mornings"],
        "attractions": [{ "name": "Wat Xieng Thong", "note": "…" }],
        "hiddenGems": [{ "name": "Ban Xang Khong weaving lane", "note": "…" }],
        "localExperiences": [{ "name": "Dawn alms round", "note": "…" }],
        "bestTimeToVisit": "November to February — cool, dry, festival season",
        "dailyBudgetEstimate": "$35-55/day"
      }
    ]
  }
}
```
Always exactly 3 destinations (schema allows 1–6 defensively). Side effect: one `discovery` journey entry.

---

## POST `/api/story` — Feature 2 (streaming)

Request:
```json
{ "destination": "Varanasi", "focus": "all" }
```
`focus` ∈ history/legends/traditions/folklore/all (default `all`).

Response `200`: **`text/plain; charset=utf-8` stream** of Markdown narration (600–900 words), flushed chunk-by-chunk as Gemini writes. Not JSON — the client renders it incrementally. Side effect: one `story` journey entry.

---

## POST `/api/time-portal` — Feature 3

Request:
```json
{ "destination": "Kyoto", "era": "hundred-years" }
```
`era` ∈ present/fifty-years/hundred-years/ancient. One era per call; the client caches eras per destination.

Response `200`:
```json
{
  "data": {
    "era": "hundred-years",
    "eraLabel": "100 Years Ago",
    "approximatePeriod": "c. 1920s",
    "sceneSetting": "You step off the wooden tram…",
    "dailyLife": "…",
    "culturalPractices": ["…"],
    "majorEvents": [{ "year": "1928", "event": "…" }],
    "environment": "…",
    "whatSurvivesToday": "…"
  }
}
```

---

## POST `/api/companions/chat` — Feature 4

Request:
```json
{
  "destination": "Hanoi",
  "personaId": "food-vendor",
  "history": [
    { "role": "user", "text": "What should I eat first?" },
    { "role": "model", "text": "Ha! You start with phở, of course…" }
  ],
  "message": "Where do locals actually eat it?"
}
```
`personaId` ∈ artisan/historian/storyteller/musician/food-vendor · `history` ≤ 30 messages (client-held state; server is stateless) · `message` 1–1000 chars.

Response `200`:
```json
{ "data": { "reply": "Not the places with photo menus, I promise you that…" } }
```
Side effect: a `companion-chat` journey entry on the **first** message of a conversation only.

---

## POST `/api/heritage` — Feature 5

Request: `{ "destination": "Fez" }`

Response `200`:
```json
{
  "data": {
    "destination": "Fez",
    "items": [
      {
        "name": "Hand-cut zellige tilework",
        "category": "craft",
        "story": "…",
        "whyItMatters": "…",
        "whyItIsDisappearing": "…",
        "howVisitorsCanHelp": ["Buy directly from workshop cooperatives…"],
        "urgency": "endangered",
        "whereToExperience": "…"
      }
    ]
  }
}
```
`category` ∈ craft/music/oral-tradition/neighborhood/ritual/cuisine/other · `urgency` ∈ stable/declining/endangered/critically-endangered. 4–6 items typical (schema caps at 8).

---

## POST `/api/events` — Feature 6

Request:
```json
{ "destination": "Oaxaca", "startDate": "2026-10-25", "endDate": "2026-11-05" }
```
Dates `yyyy-mm-dd`; `endDate ≥ startDate`; window ≤ 90 days.

Response `200`:
```json
{
  "data": {
    "destination": "Oaxaca",
    "events": [
      {
        "name": "Día de los Muertos",
        "timing": "October 31 – November 2 (fixed dates)",
        "type": "festival",
        "description": "…",
        "significance": "…",
        "localCustoms": ["Families build marigold-covered ofrendas…"],
        "visitorEtiquette": ["Ask before photographing altars or mourners…"]
      }
    ]
  }
}
```

---

## `/api/storybook` — Feature 7

**POST** — generate. Request: `{ "travelerName": "Kunal" }` (optional; falls back to the Firebase display name, then "A Traveler").

- `409 empty_journey` if the user has no journey entries yet.
- `200`:
```json
{
  "data": {
    "id": "sb_abc123",
    "title": "Kunal's Journey Through Living History",
    "dedication": "For the traveler who listens before he looks.",
    "chapters": [{ "heading": "Where the River Keeps the Score", "body": "You began in Varanasi…" }],
    "epilogue": "…",
    "createdAt": 1780560000000
  }
}
```
The memoir is grounded exclusively in the user's stored journey entries; the prompt forbids inventing visits. Saved to Firestore before returning.

**GET** — list. Response `200`: `{ "data": { "storybooks": [ …same shape… ] } }` (newest first, ≤ 20).

---

## GET `/api/journey`

Returns the raw journey log for the storybook page:

```json
{
  "data": {
    "entries": [
      {
        "id": "e1",
        "type": "story",
        "destination": "Varanasi",
        "summary": "Listened to the cultural story of Varanasi (focus: all).",
        "createdAt": 1780470000000
      }
    ]
  }
}
```
Oldest-first, ≤ 60 entries.
