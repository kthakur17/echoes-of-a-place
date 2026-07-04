/**
 * Live smoke test for the Firebase Admin integration.
 * Loads .env.local, initializes the Admin SDK from FIREBASE_SERVICE_ACCOUNT_B64,
 * then writes, reads, and deletes a probe document in Firestore.
 *
 * Usage: node scripts/verify-firebase.mjs
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#") && !process.env[m[1]]) {
      process.env[m[1]] = m[2];
    }
  }
} catch {
  // rely on ambient environment
}

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
if (!b64) {
  console.error("FAIL: FIREBASE_SERVICE_ACCOUNT_B64 is not set.");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
console.log(`Service account: ${serviceAccount.client_email}`);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const probe = db.collection("_verify").doc("probe");
await probe.set({ ok: true, at: Date.now() });
const snap = await probe.get();
if (!snap.exists || snap.data().ok !== true) throw new Error("probe read mismatch");
await probe.delete();

console.log("PASS: Firestore write / read / delete via Admin SDK");
console.log("\nFirebase Admin integration verified.");
