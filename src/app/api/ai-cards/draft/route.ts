import { NextResponse } from "next/server";

import { ALL_LEVELS } from "@/data/cards";
import { generateAiQuestion, pickRandomTruthLevel } from "@/lib/ai/generate";
import { isAiGenerateRateLimited } from "@/lib/ai/rateLimit";
import { withSession } from "@/lib/api";
import { getLastAiCardCreatedAt } from "@/lib/db";

/**
 * Generates a question for preview only — unlike POST /api/ai-cards/generate, this
 * never writes to `ai_cards`. Backs the "ask AI to draft one" option inside the manual
 * Add Card flow (see CardFormModal.tsx): the drafted text lands in the textarea, and
 * only becomes a real card if/when the user hits Save — at which point it's a normal
 * user-owned `cards` row like any manually typed one, not an `ai_cards` row. The
 * game's own AI-fallback flow (POST /api/ai-cards/generate, used when the deck runs
 * dry mid-game) is untouched by this route.
 */
export const POST = withSession(async (_session, request: Request) => {
  const body = await request.json().catch(() => ({}));
  const { level } = body;

  if (level !== undefined && !ALL_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  // Shares the generate route's rate limit (same underlying LLM cost/quota), even
  // though this route itself never writes the `ai_cards` row that limit is measured
  // against — good enough for this app's threat model (two known users), see
  // .claude/database-guidelines.md.
  const lastGeneratedAt = await getLastAiCardCreatedAt();
  if (isAiGenerateRateLimited(lastGeneratedAt, new Date())) {
    return NextResponse.json(
      { error: "Generating too fast — wait a few seconds and try again." },
      { status: 429 },
    );
  }

  const targetLevel = level ?? pickRandomTruthLevel();
  const { question } = await generateAiQuestion(targetLevel);
  return NextResponse.json({ level: targetLevel, question });
});
