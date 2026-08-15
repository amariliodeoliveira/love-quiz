import { generateText } from "ai";

import { type Level, LEVEL_META } from "@/data/cards";

import { buildPromptContext, type PromptContext } from "./context";
import { AI_MODEL_ID, aiModel } from "./model";

const TRUTH_LEVELS: Level[] = ["1", "2", "3"];

/** Used when the caller (the exhausted-deck screen in the game) doesn't ask for a
 * specific level — the deck's truth pool is what ran out, so that's what to refill. */
export function pickRandomTruthLevel(): Level {
  return TRUTH_LEVELS[Math.floor(Math.random() * TRUTH_LEVELS.length)];
}

export function buildPrompt(context: PromptContext, level: Level): string {
  const meta = LEVEL_META[level];
  const kind = level === "dare" ? "a dare" : "a truth question";
  const avoid = [context.summary, ...context.recentQuestions].filter(Boolean);
  const avoidList = avoid.map((item) => `- ${item}`).join("\n");

  return [
    `Generate ${kind} for a couple's "truth or dare" game.`,
    `Intensity level: ${meta.label}.`,
    avoid.length > 0
      ? `Do not repeat these topics or questions already used:\n${avoidList}`
      : null,
    "Reply in English, with only the question/dare text — no quotes, no numbering, no explanation.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function generateAiQuestion(
  level: Level,
): Promise<{ question: string; model: string; context: PromptContext }> {
  const context = await buildPromptContext();
  const { text } = await generateText({
    model: aiModel,
    prompt: buildPrompt(context, level),
  });

  const question = text.trim();
  if (!question) {
    throw new Error("AI returned an empty question");
  }
  return { question, model: AI_MODEL_ID, context };
}
