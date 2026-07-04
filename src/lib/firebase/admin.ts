import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK — server only. Credentials come from
 * FIREBASE_SERVICE_ACCOUNT_B64 (base64-encoded service-account JSON) so no
 * key file ever sits in the repo or the client bundle.
 */

let app: App | null = null;

function getAdminApp(): App {
  if (app) return app;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0];
    return app;
  }

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!b64) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_B64 is not configured. Copy .env.example to .env.local and set it.",
    );
  }
  const serviceAccount = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  app = initializeApp({ credential: cert(serviceAccount) });
  return app;
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}
