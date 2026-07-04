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

import { POST } from "@/app/api/events/route";

const FAKE_EVENTS = {
  events: [
    {
      name: "Día de los Muertos",
      timing: "October 31 – November 2 (fixed dates)",
      type: "festival",
      description: "Families welcome back the souls of the departed...",
      significance: "A syncretic tradition blending Mesoamerican and Catholic rites...",
      localCustoms: ["Building marigold-covered ofrendas"],
      visitorEtiquette: ["Ask before photographing altars or mourners"],
    },
  ],
};

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mocks.requireAuth.mockResolvedValue({ uid: "user-1", name: null });
    mocks.generateStructured.mockResolvedValue(FAKE_EVENTS);
    mocks.recordJourneyEntry.mockResolvedValue(undefined);
  });

  it("returns events for a valid window and passes dates into the prompt", async () => {
    const res = await POST(
      makeRequest({ destination: "Oaxaca", startDate: "2026-10-25", endDate: "2026-11-05" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.events[0].name).toContain("Muertos");

    const call = mocks.generateStructured.mock.calls[0][0];
    expect(call.prompt).toContain("2026-10-25 to 2026-11-05");
  });

  it("rejects a reversed date window with 400 before touching Gemini", async () => {
    const res = await POST(
      makeRequest({ destination: "Oaxaca", startDate: "2026-11-05", endDate: "2026-10-25" }),
    );
    expect(res.status).toBe(400);
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });

  it("rejects a window longer than 90 days", async () => {
    const res = await POST(
      makeRequest({ destination: "Oaxaca", startDate: "2026-01-01", endDate: "2026-12-31" }),
    );
    expect(res.status).toBe(400);
  });
});
