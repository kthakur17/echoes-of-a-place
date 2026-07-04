import { rateLimited } from "@/lib/apiError";

/**
 * Sliding-window in-memory rate limiter, keyed per user.
 *
 * Suitable for a single-instance deployment. On multi-instance serverless the
 * window is per-instance, so this is a soft limit; swap for a Redis/Firestore
 * counter if hard global limits are needed (see docs/security.md).
 */
const WINDOW_MS = 60_000;
const buckets = new Map<string, number[]>();

export function checkRateLimit(key: string, maxPerMinute = 15): void {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= maxPerMinute) {
    throw rateLimited();
  }
  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => t <= cutoff)) buckets.delete(k);
    }
  }
}

/** Test hook — clears all rate-limit state. */
export function resetRateLimits(): void {
  buckets.clear();
}
