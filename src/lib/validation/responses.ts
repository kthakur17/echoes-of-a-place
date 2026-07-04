import { z } from "zod";

/**
 * Zod schemas for validating Gemini's structured JSON output.
 *
 * Structural fields are strict (invalid shape triggers a corrective retry in
 * generateStructured); enum-ish fields use .catch() fallbacks so one creative
 * label from the model doesn't fail an otherwise good response.
 */

const namedNote = z.object({
  name: z.string().min(1),
  note: z.string().min(1),
});

export const destinationRecommendationSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  tagline: z.string().min(1),
  whyItMatters: z.string().min(1),
  matchedDesires: z.array(z.string().min(1)).min(1),
  attractions: z.array(namedNote).min(1),
  hiddenGems: z.array(namedNote).min(1),
  localExperiences: z.array(namedNote).min(1),
  bestTimeToVisit: z.string().min(1),
  dailyBudgetEstimate: z.string().min(1),
});

export const discoveryResponseSchema = z.object({
  destinations: z.array(destinationRecommendationSchema).min(1).max(6),
});

export const eraPortraitSchema = z.object({
  era: z.enum(["present", "fifty-years", "hundred-years", "ancient"]),
  eraLabel: z.string().min(1),
  approximatePeriod: z.string().min(1),
  sceneSetting: z.string().min(1),
  dailyLife: z.string().min(1),
  culturalPractices: z.array(z.string().min(1)).min(1),
  majorEvents: z.array(z.object({ year: z.string().min(1), event: z.string().min(1) })).min(1),
  environment: z.string().min(1),
  whatSurvivesToday: z.string().min(1),
});

export const heritageItemSchema = z.object({
  name: z.string().min(1),
  category: z
    .enum(["craft", "music", "oral-tradition", "neighborhood", "ritual", "cuisine", "other"])
    .catch("other"),
  story: z.string().min(1),
  whyItMatters: z.string().min(1),
  whyItIsDisappearing: z.string().min(1),
  howVisitorsCanHelp: z.array(z.string().min(1)).min(1),
  urgency: z
    .enum(["stable", "declining", "endangered", "critically-endangered"])
    .catch("declining"),
  whereToExperience: z.string().min(1),
});

export const heritageResponseSchema = z.object({
  items: z.array(heritageItemSchema).min(1).max(8),
});

export const culturalEventSchema = z.object({
  name: z.string().min(1),
  timing: z.string().min(1),
  type: z
    .enum([
      "festival",
      "community-gathering",
      "exhibition",
      "performance",
      "celebration",
      "market",
      "other",
    ])
    .catch("other"),
  description: z.string().min(1),
  significance: z.string().min(1),
  localCustoms: z.array(z.string().min(1)).min(1),
  visitorEtiquette: z.array(z.string().min(1)).min(1),
});

export const eventsResponseSchema = z.object({
  events: z.array(culturalEventSchema).min(1).max(10),
});

export const storybookResponseSchema = z.object({
  title: z.string().min(1),
  dedication: z.string().min(1),
  chapters: z
    .array(z.object({ heading: z.string().min(1), body: z.string().min(1) }))
    .min(1)
    .max(12),
  epilogue: z.string().min(1),
});
