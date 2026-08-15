import { generateText } from "ai";

import {
  countAiCardsSinceContextUpdate,
  getAiContextSummary,
  getAnsweredQuestions,
  upsertAiContextSummary,
} from "@/lib/db";

import { aiModel } from "./model";

const SUMMARY_REFRESH_THRESHOLD = 10;

export interface PromptContext {
  summary: string;
  recentQuestions: string[];
}

/** Compact context fed into every generation prompt: the running summary plus every
 * already-answered question (across both tables). At this deck's scale (tens to low
 * hundreds of cards) sending the full list is still cheap — capping it to a "recent"
 * window let older questions become invisible to the model and get regenerated, which
 * is exactly the repeat this whole feature exists to prevent. */
export async function buildPromptContext(): Promise<PromptContext> {
  const [summary, recentQuestions] = await Promise.all([
    getAiContextSummary(),
    getAnsweredQuestions(),
  ]);

  return { summary, recentQuestions };
}

export function buildSummaryPrompt(
  previousSummary: string,
  recentQuestions: string[],
): string {
  const questionList = recentQuestions.map((q) => `- ${q}`).join("\n");
  return [
    "You maintain a short summary of the topics already used in a couple's truth-or-dare game, so future questions don't repeat them.",
    previousSummary
      ? `Current summary:\n${previousSummary}`
      : "There is no summary yet — write one from scratch.",
    `Recently answered questions:\n${questionList}`,
    "Rewrite the summary incorporating these new topics. Reply with only the updated summary, in English, in at most 5 lines, with no introduction.",
  ].join("\n\n");
}

/** Regenerates the compact summary once enough new AI cards have piled up since the
 * last refresh, so the prompt context stays useful without growing without bound.
 * Takes the context the caller already built for its generation request, instead of
 * re-querying both tables again for the same data a few lines later. */
export async function maybeRefreshSummary(
  context: PromptContext,
): Promise<void> {
  const newCardCount = await countAiCardsSinceContextUpdate();
  if (newCardCount < SUMMARY_REFRESH_THRESHOLD) return;
  if (context.recentQuestions.length === 0) return;

  const { text } = await generateText({
    model: aiModel,
    prompt: buildSummaryPrompt(context.summary, context.recentQuestions),
  });
  await upsertAiContextSummary(text.trim());
}
