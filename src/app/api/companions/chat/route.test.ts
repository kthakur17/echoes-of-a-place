// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { resetRateLimits } from "@/lib/rateLimit";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  generateChatReply: vi.fn(),
  recordJourneyEntry: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/gemini/client", () => ({ generateChatReply: mocks.generateChatReply }));
vi.mock("@/lib/journey/server", () => ({ recordJourneyEntry: mocks.recordJourneyEntry }));

import { POST } from "@/app/api/companions/chat/route";

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/companions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/companions/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mocks.requireAuth.mockResolvedValue({ uid: "user-1", name: null });
    mocks.generateChatReply.mockResolvedValue("Not the places with photo menus, I promise you.");
    mocks.recordJourneyEntry.mockResolvedValue(undefined);
  });

  it("returns the persona's reply and threads history through to Gemini", async () => {
    const history = [
      { role: "user", text: "What should I eat first?" },
      { role: "model", text: "Phở, of course!" },
    ];
    const res = await POST(
      makeRequest({
        destination: "Hanoi",
        personaId: "food-vendor",
        history,
        message: "Where do locals actually eat it?",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.reply).toContain("photo menus");

    const call = mocks.generateChatReply.mock.calls[0][0];
    expect(call.history).toHaveLength(2);
    expect(call.systemInstruction).toContain("Auntie Lan");
    expect(call.systemInstruction).toContain("Hanoi");
  });

  it("records a journey entry only on the first message of a conversation", async () => {
    await POST(
      makeRequest({ destination: "Hanoi", personaId: "food-vendor", history: [], message: "Hello!" }),
    );
    expect(mocks.recordJourneyEntry).toHaveBeenCalledTimes(1);

    mocks.recordJourneyEntry.mockClear();
    await POST(
      makeRequest({
        destination: "Hanoi",
        personaId: "food-vendor",
        history: [{ role: "user", text: "Hello!" }],
        message: "And dessert?",
      }),
    );
    expect(mocks.recordJourneyEntry).not.toHaveBeenCalled();
  });

  it("rejects an unknown persona with 400 before touching Gemini", async () => {
    const res = await POST(
      makeRequest({ destination: "Hanoi", personaId: "pirate", history: [], message: "Arr" }),
    );
    expect(res.status).toBe(400);
    expect(mocks.generateChatReply).not.toHaveBeenCalled();
  });
});
