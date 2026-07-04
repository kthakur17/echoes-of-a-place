import { type NextRequest, NextResponse } from "next/server";
import { guardRequest } from "@/lib/guard";
import { toErrorResponse } from "@/lib/apiError";
import { listJourneyEntries } from "@/lib/journey/server";

export const runtime = "nodejs";

/** Journey log — powers the Storybook page's "your journey so far" view. */
export async function GET(req: NextRequest) {
  try {
    const user = await guardRequest(req, 30);
    const entries = await listJourneyEntries(user.uid);
    return NextResponse.json({ data: { entries } });
  } catch (err) {
    return toErrorResponse(err);
  }
}
