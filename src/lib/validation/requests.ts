import { z } from "zod";

/**
 * Request validation for every API route. All user-supplied text is length-
 * bounded and stripped of control characters before it reaches a prompt —
 * the first line of defense against prompt-injection and abuse.
 */

// \p{Cc} = Unicode control characters (C0 range, DEL, C1 range).
const CONTROL_CHARS = /\p{Cc}/gu;

export const safeText = (min: number, max: number) =>
  z
    .string()
    .transform((s) => s.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim())
    .pipe(z.string().min(min).max(max));

export const destinationSchema = safeText(2, 80);

export const discoveryRequestSchema = z.object({
  interests: z.array(safeText(2, 40)).min(1).max(10),
  budget: z.enum(["shoestring", "moderate", "comfortable", "luxury"]),
  durationDays: z.number().int().min(1).max(60),
  travelStyle: z.enum([
    "slow-immersive",
    "adventurous",
    "family",
    "solo-reflective",
    "social",
  ]),
  emotionalGoal: safeText(3, 300),
  homeRegion: safeText(2, 80).optional(),
});

export const storyRequestSchema = z.object({
  destination: destinationSchema,
  focus: z.enum(["history", "legends", "traditions", "folklore", "all"]).default("all"),
});

export const timePortalRequestSchema = z.object({
  destination: destinationSchema,
  era: z.enum(["present", "fifty-years", "hundred-years", "ancient"]),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: safeText(1, 2000),
});

export const companionChatRequestSchema = z.object({
  destination: destinationSchema,
  personaId: z.enum(["artisan", "historian", "storyteller", "musician", "food-vendor"]),
  // A genuine conversation strictly alternates user/model starting with the
  // user; enforcing that shape blocks bulk-forged "model" turns from being
  // injected as fake conversation memory.
  history: z
    .array(chatMessageSchema)
    .max(30)
    .default([])
    .refine(
      (h) => h.every((m, i) => m.role === (i % 2 === 0 ? "user" : "model")),
      "history must alternate user/model, starting with user",
    ),
  message: safeText(1, 1000),
});

export const heritageRequestSchema = z.object({
  destination: destinationSchema,
});

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected yyyy-mm-dd")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Not a real date");

export const eventsRequestSchema = z
  .object({
    destination: destinationSchema,
    startDate: isoDate,
    endDate: isoDate,
  })
  .refine((v) => Date.parse(v.endDate) >= Date.parse(v.startDate), {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  })
  .refine(
    (v) => Date.parse(v.endDate) - Date.parse(v.startDate) <= 90 * 86_400_000,
    { message: "Date range cannot exceed 90 days", path: ["endDate"] },
  );

export const storybookRequestSchema = z.object({
  travelerName: safeText(2, 60).optional(),
});
