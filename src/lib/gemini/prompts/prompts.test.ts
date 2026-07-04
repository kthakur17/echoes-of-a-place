import { describe, expect, it } from "vitest";
import { buildDiscoveryPrompt, DISCOVERY_SYSTEM } from "@/lib/gemini/prompts/discovery";
import { buildStoryPrompt } from "@/lib/gemini/prompts/story";
import { buildTimePortalPrompt } from "@/lib/gemini/prompts/timePortal";
import { buildCompanionSystem } from "@/lib/gemini/prompts/companions";
import { buildHeritagePrompt } from "@/lib/gemini/prompts/heritage";
import { buildEventsPrompt } from "@/lib/gemini/prompts/events";
import { buildStorybookPrompt } from "@/lib/gemini/prompts/storybook";
import { INJECTION_GUARD } from "@/lib/gemini/prompts/shared";

describe("prompt builders", () => {
  it("discovery prompt embeds every traveler input inside fenced tags", () => {
    const prompt = buildDiscoveryPrompt({
      interests: ["History", "Crafts & artisans"],
      budget: "moderate",
      durationDays: 10,
      travelStyle: "solo-reflective",
      emotionalGoal: "hidden gems instead of crowds",
    });
    expect(prompt).toContain("<interests>\nHistory, Crafts & artisans\n</interests>");
    expect(prompt).toContain("<emotional_goal>\nhidden gems instead of crowds\n</emotional_goal>");
    expect(prompt).toContain("<trip_length_days>\n10\n</trip_length_days>");
    expect(prompt).toContain('"destinations"');
  });

  it("discovery system prompt carries the injection guard", () => {
    expect(DISCOVERY_SYSTEM).toContain(INJECTION_GUARD);
  });

  it("story prompt adapts to the chosen focus", () => {
    const legends = buildStoryPrompt({ destination: "Varanasi", focus: "legends" });
    const traditions = buildStoryPrompt({ destination: "Varanasi", focus: "traditions" });
    expect(legends).toContain("legends and myths");
    expect(traditions).toContain("living traditions");
    expect(legends).toContain("<destination>\nVaranasi\n</destination>");
  });

  it("time portal prompt pins the requested era in the JSON contract", () => {
    const prompt = buildTimePortalPrompt({ destination: "Kyoto", era: "hundred-years" });
    expect(prompt).toContain('"era": "hundred-years"');
    expect(prompt).toContain("100 YEARS AGO");
  });

  it("companion system stays in character and includes the destination", () => {
    const system = buildCompanionSystem("food-vendor", "Hanoi");
    expect(system).toContain("Auntie Lan");
    expect(system).toContain("<destination>\nHanoi\n</destination>");
    expect(system).toContain(INJECTION_GUARD);
  });

  it("heritage prompt asks for urgency and preservation actions", () => {
    const prompt = buildHeritagePrompt({ destination: "Fez" });
    expect(prompt).toContain('"urgency"');
    expect(prompt).toContain("howVisitorsCanHelp");
  });

  it("events prompt carries the travel window and etiquette contract", () => {
    const prompt = buildEventsPrompt({
      destination: "Oaxaca",
      startDate: "2026-10-25",
      endDate: "2026-11-05",
    });
    expect(prompt).toContain("2026-10-25 to 2026-11-05");
    expect(prompt).toContain("visitorEtiquette");
  });

  it("storybook prompt lists real journey entries chronologically", () => {
    const prompt = buildStorybookPrompt({
      travelerName: "Kunal",
      entries: [
        {
          id: "1",
          type: "story",
          destination: "Jaipur",
          summary: "Listened to the cultural story of Jaipur.",
          createdAt: Date.UTC(2026, 6, 1),
        },
        {
          id: "2",
          type: "heritage",
          destination: "Jaipur",
          summary: "Explored hidden heritage of Jaipur: blue pottery.",
          createdAt: Date.UTC(2026, 6, 2),
        },
      ],
    });
    expect(prompt).toContain("<traveler_name>\nKunal\n</traveler_name>");
    expect(prompt).toContain("1. [2026-07-01] listened to the story of Jaipur");
    expect(prompt).toContain("2. [2026-07-02] explored hidden heritage of Jaipur");
    expect(prompt).toContain("do not invent visits");
  });
});
