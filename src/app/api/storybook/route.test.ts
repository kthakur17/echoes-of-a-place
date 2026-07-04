// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { resetRateLimits } from "@/lib/rateLimit";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  generateStructured: vi.fn(),
  listJourneyEntries: vi.fn(),
  listStorybooks: vi.fn(),
  saveStorybook: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/gemini/client", () => ({ generateStructured: mocks.generateStructured }));
vi.mock("@/lib/journey/server", () => ({
  listJourneyEntries: mocks.listJourneyEntries,
  listStorybooks: mocks.listStorybooks,
  saveStorybook: mocks.saveStorybook,
}));

import { GET, POST } from "@/app/api/storybook/route";

const FAKE_MEMOIR = {
  title: "Kunal's Journey Through Jaipur",
  dedication: "For the traveler who listens.",
  chapters: [{ heading: "The Pink City Speaks", body: "You began in Jaipur..." }],
  epilogue: "The conversation continues.",
};

function makeRequest(method: "GET" | "POST", body?: unknown): NextRequest {
  return new Request("http://localhost/api/storybook", {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }) as unknown as NextRequest;
}

describe("/api/storybook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mocks.requireAuth.mockResolvedValue({ uid: "user-1", name: "Kunal" });
    mocks.generateStructured.mockResolvedValue(FAKE_MEMOIR);
    mocks.saveStorybook.mockImplementation(async (_uid, book) => ({ id: "sb-1", ...book }));
    mocks.listStorybooks.mockResolvedValue([]);
  });

  it("POST returns 409 when the journey log is empty", async () => {
    mocks.listJourneyEntries.mockResolvedValue([]);
    const res = await POST(makeRequest("POST", {}));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe("empty_journey");
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });

  it("POST compiles real journey entries into a saved memoir", async () => {
    mocks.listJourneyEntries.mockResolvedValue([
      {
        id: "e1",
        type: "story",
        destination: "Jaipur",
        summary: "Listened to the cultural story of Jaipur.",
        createdAt: Date.UTC(2026, 6, 1),
      },
    ]);

    const res = await POST(makeRequest("POST", { travelerName: "Kunal" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("sb-1");
    expect(body.data.title).toContain("Jaipur");

    // The prompt must be grounded in the user's actual journey.
    const call = mocks.generateStructured.mock.calls[0][0];
    expect(call.prompt).toContain("Jaipur");
    expect(call.prompt).toContain("Kunal");

    expect(mocks.saveStorybook).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ title: FAKE_MEMOIR.title }),
    );
  });

  it("GET lists the user's saved storybooks", async () => {
    mocks.listStorybooks.mockResolvedValue([{ id: "sb-9", ...FAKE_MEMOIR, createdAt: 1 }]);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.storybooks).toHaveLength(1);
    expect(mocks.listStorybooks).toHaveBeenCalledWith("user-1");
  });
});
