import { NextResponse } from "next/server";
import { getRandomUnansweredManualTruth } from "@/lib/db";
import { withSession } from "@/lib/api";

/** Cheap check for the game's AI fallback flow: is there an unanswered manual truth
 * right now? Returns at most one card — never the full pool. */
export const GET = withSession(async () => {
  const card = await getRandomUnansweredManualTruth();
  return NextResponse.json({ card });
});
