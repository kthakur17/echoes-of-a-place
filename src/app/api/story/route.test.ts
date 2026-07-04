// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { resetRateLimits } from "@/lib/rateLimit";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  generateNarrationStream: vi.fn(),
  recordJourneyEntry: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/gemini/client", () => ({
  generateNarrationStream: mocks.generateNarrationStream,
}));
vi.mock("@/lib/journey/server", () => ({ recordJourneyEntry: mocks.recordJourneyEntry }));

import { POST } from "@/app/api/story/route";

function textStream(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/story", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/story", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mocks.requireAuth.mockResolvedValue({ uid: "user-1", name: null });
    mocks.generateNarrationStream.mockResolvedValue(
      textStream("Imagine standing on the ghats ", "at sunrise..."),
    );
    mocks.recordJourneyEntry.mockResolvedValue(undefined);
  });

  it("streams narration as text/plain and records the journey", async () => {
    const res = await POST(makeRequest({ destination: "Varanasi", focus: "legends" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");

    const text = await new Response(res.body).text();
    expect(text).toBe("Imagine standing on the ghats at sunrise...");

    const [uid, entry] = mocks.recordJourneyEntry.mock.calls[0];
    expect(uid).toBe("user-1");
    expect(entry.type).toBe("story");
    expect(entry.destination).toBe("Varanasi");
  });

  it("defaults focus to 'all' and passes the destination into the prompt", async () => {
    await POST(makeRequest({ destination: "Fez" }));
    const call = mocks.generateNarrationStream.mock.calls[0][0];
    expect(call.prompt).toContain("Fez");
  });

  it("rejects an invalid focus with 400 before touching Gemini", async () => {
    const res = await POST(makeRequest({ destination: "Fez", focus: "gossip" }));
    expect(res.status).toBe(400);
    expect(mocks.generateNarrationStream).not.toHaveBeenCalled();
  });
});
