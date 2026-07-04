// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { unauthorized } from "@/lib/apiError";
import { resetRateLimits } from "@/lib/rateLimit";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  generateStructured: vi.fn(),
  recordJourneyEntry: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/gemini/client", () => ({ generateStructured: mocks.generateStructured }));
vi.mock("@/lib/journey/server", () => ({ recordJourneyEntry: mocks.recordJourneyEntry }));

import { POST } from "@/app/api/discover/route";

const VALID_BODY = {
  interests: ["History"],
  budget: "moderate",
  durationDays: 7,
  travelStyle: "slow-immersive",
  emotionalGoal: "a peaceful spiritual weekend",
};

const FAKE_RESULT = {
  destinations: [
    {
      name: "Luang Prabang",
      country: "Laos",
      region: "Northern Laos",
      tagline: "Where monks still own the morning",
      whyItMatters: "It answers your longing for stillness.",
      matchedDesires: ["peace"],
      attractions: [{ name: "Mount Phousi", note: "Sunrise views over the Mekong." }],
      hiddenGems: [{ name: "Ock Pop Tok", note: "Living weaving village." }],
      localExperiences: [{ name: "Alms giving", note: "Dawn ritual with resident monks." }],
      bestTimeToVisit: "November to February",
      dailyBudgetEstimate: "$35-55/day",
    },
  ],
};

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/discover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mocks.requireAuth.mockResolvedValue({ uid: "user-1", name: "Test User" });
    mocks.generateStructured.mockResolvedValue(FAKE_RESULT);
    mocks.recordJourneyEntry.mockResolvedValue(undefined);
  });

  it("returns 401 when auth fails", async () => {
    mocks.requireAuth.mockRejectedValue(unauthorized());
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid body and never calls Gemini", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, interests: [] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_request");
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });

  it("returns recommendations and records a journey entry on success", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.destinations).toHaveLength(1);
    expect(body.data.destinations[0].name).toBe("Luang Prabang");

    expect(mocks.recordJourneyEntry).toHaveBeenCalledTimes(1);
    const [uid, entry] = mocks.recordJourneyEntry.mock.calls[0];
    expect(uid).toBe("user-1");
    expect(entry.type).toBe("discovery");
    expect(entry.summary).toContain("Luang Prabang");
  });

  it("passes the traveler's inputs into the Gemini prompt", async () => {
    await POST(makeRequest(VALID_BODY));
    const call = mocks.generateStructured.mock.calls[0][0];
    expect(call.prompt).toContain("a peaceful spiritual weekend");
    expect(call.prompt).toContain("slow-immersive");
  });

  it("maps upstream AI failures to a 502 without leaking details", async () => {
    const { upstreamAiError } = await import("@/lib/apiError");
    mocks.generateStructured.mockRejectedValue(upstreamAiError());
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error.code).toBe("upstream_ai_error");
  });
});
