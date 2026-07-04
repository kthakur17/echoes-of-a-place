import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/rateLimit";
import { ApiError } from "@/lib/apiError";

describe("checkRateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows requests under the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(() => checkRateLimit("user-a", 5)).not.toThrow();
    }
  });

  it("throws a 429 ApiError once the limit is exceeded", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("user-b", 3);
    try {
      checkRateLimit("user-b", 3);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(429);
      expect((err as ApiError).code).toBe("rate_limited");
    }
  });

  it("tracks users independently", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("user-c", 3);
    expect(() => checkRateLimit("user-d", 3)).not.toThrow();
  });
});
