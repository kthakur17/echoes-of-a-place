import { adminDb } from "@/lib/firebase/admin";
import type { JourneyEntry, JourneyEntryType, Storybook } from "@/types";

/**
 * Journey tracking — every meaningful cultural interaction is recorded so the
 * Journey Storybook (Feature 7) can compile a real memoir from what the user
 * actually explored. Writes happen server-side only (Firestore rules deny
 * client writes to these collections).
 */

const MAX_ENTRIES_FOR_STORYBOOK = 60;

export async function recordJourneyEntry(
  uid: string,
  entry: { type: JourneyEntryType; destination: string; summary: string },
): Promise<void> {
  try {
    await adminDb()
      .collection("users")
      .doc(uid)
      .collection("journeyEntries")
      .add({ ...entry, createdAt: Date.now() });
  } catch (err) {
    // Journey tracking must never break the primary feature response.
    console.error("[journey] failed to record entry:", err);
  }
}

export async function listJourneyEntries(uid: string): Promise<JourneyEntry[]> {
  // Take the MOST RECENT entries (desc), then restore chronological order for
  // display and memoir generation — otherwise an active user's newest
  // explorations would silently never make it into their storybook.
  const snap = await adminDb()
    .collection("users")
    .doc(uid)
    .collection("journeyEntries")
    .orderBy("createdAt", "desc")
    .limit(MAX_ENTRIES_FOR_STORYBOOK)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as JourneyEntry)
    .reverse();
}

export async function saveStorybook(
  uid: string,
  storybook: Omit<Storybook, "id">,
): Promise<Storybook> {
  const ref = await adminDb()
    .collection("users")
    .doc(uid)
    .collection("storybooks")
    .add(storybook);
  return { id: ref.id, ...storybook };
}

export async function listStorybooks(uid: string): Promise<Storybook[]> {
  const snap = await adminDb()
    .collection("users")
    .doc(uid)
    .collection("storybooks")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Storybook);
}
