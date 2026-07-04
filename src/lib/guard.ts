import { requireAuth, type AuthedUser } from "@/lib/auth/server";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Requests per minute allowed from a single source IP, across all users.
 * This blunts quota-farming through freshly minted anonymous uids: a script
 * can create new guest sessions, but they all share the caller's IP budget.
 * (Firebase App Check is the full production answer — see docs/security.md.)
 */
const IP_LIMIT_PER_MINUTE = 60;

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * Shared entry guard for every API route: verify the Firebase session, then
 * rate-limit twice — per source IP and per user.
 */
export async function guardRequest(req: Request, maxPerMinute = 15): Promise<AuthedUser> {
  const user = await requireAuth(req);
  checkRateLimit(`ip:${clientIp(req)}`, IP_LIMIT_PER_MINUTE);
  checkRateLimit(`uid:${user.uid}`, maxPerMinute);
  return user;
}
