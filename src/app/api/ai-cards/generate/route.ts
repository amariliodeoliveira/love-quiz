import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { waitUntil } from "@vercel/functions";
import { ALL_LEVELS } from "@/data/cards";
import { createAiCard } from "@/lib/db";
import { withSession } from "@/lib/api";
import { maybeRefreshSummary } from "@/lib/ai/context";
import { generateAiQuestion, pickRandomTruthLevel } from "@/lib/ai/generate";
import { GAME_PATH } from "@/lib/routes";

export const POST = withSession(async (_session, request: Request) => {
  const body = await request.json().catch(() => ({}));
  const { level } = body;

  if (level !== undefined && !ALL_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  const targetLevel = level ?? pickRandomTruthLevel();
  const { question, model, context } = await generateAiQuestion(targetLevel);
  const card = await createAiCard(targetLevel, question, model);

  // Runs after the response is sent — refreshing the summary shouldn't make the player
  // wait on a second LLM call every 10th generation. waitUntil keeps the serverless
  // function alive long enough for it to finish without holding up the response. Reuses
  // the context generateAiQuestion already built instead of re-querying both tables.
  waitUntil(maybeRefreshSummary(context));

  revalidatePath(GAME_PATH);
  return NextResponse.json({ card });
});
