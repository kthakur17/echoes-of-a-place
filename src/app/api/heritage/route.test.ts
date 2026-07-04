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

import { POST } from "@/app/api/heritage/route";

const FAKE_ITEMS = {
  items: [
    {
      name: "Hand-cut zellige tilework",
      category: "craft",
      story: "In the workshops of the medina...",
      whyItMatters: "Each pattern encodes centuries of geometry...",
      whyItIsDisappearing: "Machine-cut imitations undercut hand work...",
      howVisitorsCanHelp: ["Buy directly from workshop cooperatives"],
      urgency: "endangered",
      whereToExperience: "The artisan quarter near the tanneries.",
    },
  ],
};

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/heritage", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/heritage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mocks.requireAuth.mockResolvedValue({ uid: "user-1", name: null });
    mocks.generateStructured.mockResolvedValue(FAKE_ITEMS);
    mocks.recordJourneyEntry.mockResolvedValue(undefined);
  });

  it("returns heritage items and records the exploration", async () => {
    const res = await POST(makeRequest({ destination: "Fez" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.destination).toBe("Fez");
    expect(body.data.items[0].urgency).toBe("endangered");

    const [, entry] = mocks.recordJourneyEntry.mock.calls[0];
    expect(entry.type).toBe("heritage");
    expect(entry.summary).toContain("zellige");
  });

  it("rejects a too-short destination with 400 before touching Gemini", async () => {
    const res = await POST(makeRequest({ destination: "F" }));
    expect(res.status).toBe(400);
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });
});
