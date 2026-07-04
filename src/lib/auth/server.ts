import { adminAuth } from "@/lib/firebase/admin";
import { unauthorized } from "@/lib/apiError";

export interface AuthedUser {
  uid: string;
  name: string | null;
}

/**
 * Verify the Firebase ID token on an incoming API request.
 * Every generative endpoint requires this — anonymous (guest) Firebase
 * sessions pass too, but unauthenticated raw HTTP calls are rejected,
 * which keeps the Gemini key from being an open proxy.
 */
export async function requireAuth(req: Request): Promise<AuthedUser> {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) throw unauthorized();

  // Resolved outside the try so a misconfigured Admin SDK surfaces as a 500
  // (config defect), not a misleading 401 (user problem).
  const auth = adminAuth();
  try {
    const decoded = await auth.verifyIdToken(match[1]);
    return { uid: decoded.uid, name: decoded.name ?? null };
  } catch {
    throw unauthorized("Your session has expired. Please sign in again.");
  }
}
