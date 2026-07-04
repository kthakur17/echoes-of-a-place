// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { resetRateLimits } from "@/lib/rateLimit";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  generateStructured: vi.fn(),
  recordJourneyEntry: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/gemini/client", () => ({ generateStructured: mocks.generateStructured }));
vi.mock("@/lib/journey/server", () => ({ recordJourneyEntry: mocks.recordJourneyEntry }));

import { POST } from "@/app/api/time-portal/route";

const FAKE_PORTRAIT = {
  era: "hundred-years",
  eraLabel: "100 Years Ago",
  approximatePeriod: "c. 1920s",
  sceneSetting: "You step off the wooden tram...",
  dailyLife: "Merchants open their machiya shutters...",
  culturalPractices: ["Tea ceremony apprenticeships"],
  majorEvents: [{ year: "1928", event: "The enthronement ceremonies bring the nation to the city." }],
  environment: "The river runs unchanneled...",
  whatSurvivesToday: "The same lattice facades line Sannenzaka...",
};

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/time-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/time-portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mocks.requireAuth.mockResolvedValue({ uid: "user-1", name: null });
    mocks.generateStructured.mockResolvedValue(FAKE_PORTRAIT);
    mocks.recordJourneyEntry.mockResolvedValue(undefined);
  });

  it("returns the era portrait and records which era was visited", async () => {
    const res = await POST(makeRequest({ destination: "Kyoto", era: "hundred-years" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.approximatePeriod).toBe("c. 1920s");

    const [, entry] = mocks.recordJourneyEntry.mock.calls[0];
    expect(entry.type).toBe("time-portal");
    expect(entry.summary).toContain("100 Years Ago");
    expect(entry.summary).toContain("c. 1920s");
  });

  it("rejects an unknown era with 400 before touching Gemini", async () => {
    const res = await POST(makeRequest({ destination: "Kyoto", era: "jurassic" }));
    expect(res.status).toBe(400);
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });

  it("pins the requested era in the prompt contract", async () => {
    await POST(makeRequest({ destination: "Kyoto", era: "ancient" }));
    const call = mocks.generateStructured.mock.calls[0][0];
    expect(call.prompt).toContain('"era": "ancient"');
  });
});
