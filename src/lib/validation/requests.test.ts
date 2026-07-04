import { describe, expect, it } from "vitest";
import {
  companionChatRequestSchema,
  discoveryRequestSchema,
  eventsRequestSchema,
  safeText,
  storyRequestSchema,
} from "@/lib/validation/requests";

describe("safeText", () => {
  it("strips control characters and collapses whitespace", () => {
    const schema = safeText(1, 100);
    expect(schema.parse("hello\tworld\n\nagain")).toBe("hello world again");
  });

  it("rejects strings over the max after trimming", () => {
    const schema = safeText(1, 5);
    expect(() => schema.parse("toolongvalue")).toThrow();
  });
});

describe("discoveryRequestSchema", () => {
  const valid = {
    interests: ["History", "Food & cuisine"],
    budget: "moderate",
    durationDays: 7,
    travelStyle: "slow-immersive",
    emotionalGoal: "a peaceful spiritual weekend",
  };

  it("accepts a valid request", () => {
    expect(discoveryRequestSchema.parse(valid)).toMatchObject({ durationDays: 7 });
  });

  it("rejects empty interests", () => {
    expect(() => discoveryRequestSchema.parse({ ...valid, interests: [] })).toThrow();
  });

  it("rejects out-of-range duration", () => {
    expect(() => discoveryRequestSchema.parse({ ...valid, durationDays: 0 })).toThrow();
    expect(() => discoveryRequestSchema.parse({ ...valid, durationDays: 400 })).toThrow();
  });

  it("rejects unknown budget tiers", () => {
    expect(() => discoveryRequestSchema.parse({ ...valid, budget: "unlimited" })).toThrow();
  });
});

describe("storyRequestSchema", () => {
  it("defaults focus to 'all'", () => {
    expect(storyRequestSchema.parse({ destination: "Varanasi" })).toEqual({
      destination: "Varanasi",
      focus: "all",
    });
  });

  it("rejects a one-character destination", () => {
    expect(() => storyRequestSchema.parse({ destination: "V" })).toThrow();
  });
});

describe("companionChatRequestSchema", () => {
  it("caps history length at 30 turns", () => {
    const history = Array.from({ length: 31 }, () => ({ role: "user", text: "hi" }));
    expect(() =>
      companionChatRequestSchema.parse({
        destination: "Kyoto",
        personaId: "artisan",
        history,
        message: "hello",
      }),
    ).toThrow();
  });

  it("rejects unknown personas", () => {
    expect(() =>
      companionChatRequestSchema.parse({
        destination: "Kyoto",
        personaId: "pirate",
        history: [],
        message: "hello",
      }),
    ).toThrow();
  });
});

describe("eventsRequestSchema", () => {
  it("accepts a valid window", () => {
    expect(
      eventsRequestSchema.parse({
        destination: "Oaxaca",
        startDate: "2026-10-25",
        endDate: "2026-11-05",
      }),
    ).toBeTruthy();
  });

  it("rejects endDate before startDate", () => {
    expect(() =>
      eventsRequestSchema.parse({
        destination: "Oaxaca",
        startDate: "2026-11-05",
        endDate: "2026-10-25",
      }),
    ).toThrow();
  });

  it("rejects windows longer than 90 days", () => {
    expect(() =>
      eventsRequestSchema.parse({
        destination: "Oaxaca",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
      }),
    ).toThrow();
  });

  it("rejects malformed dates", () => {
    expect(() =>
      eventsRequestSchema.parse({
        destination: "Oaxaca",
        startDate: "25/10/2026",
        endDate: "2026-11-05",
      }),
    ).toThrow();
  });
});
