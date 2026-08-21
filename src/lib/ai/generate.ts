import { generateText } from "ai";

import { type Level, LEVEL_META } from "@/data/cards";

import { buildPromptContext, type PromptContext } from "./context";
import { AI_MODEL_ID, aiModel } from "./model";

const TRUTH_LEVELS: Level[] = ["1", "2", "3"];

const GAME_RULES = [
  "Write for two consenting adults in a couple, without assuming their gender, relationship history, sexual experience, living situation, or past partners.",
  "Truths may explore intimacy, curiosity, expectations, affection, compatibility, boundaries, safety, and future possibilities. Do not ask about sexual history, number of partners, past sexual acts, or anything that requires either player to describe something they have done.",
  "Never frame inexperience as a problem, compare either player with an ex or another partner, or make a question depend on a shared sexual history.",
  "Keep every card respectful, answerable at the stated intensity, and appropriate for a private conversation between partners. No humiliation, degradation, coercion, threats, danger, illegal activity, privacy violations, or impossible tasks.",
  "A dare is a concrete, optional-feeling challenge and not another question. It must be possible in the current setting, must not require sexual experience, and must not pressure either player to reveal private messages, devices, passwords, or personal information.",
  "A player may choose a dare instead of answering a truth, so truths and dares should be engaging alternatives rather than punishments.",
].join("\n");

/** Used when the caller (the exhausted-deck screen in the game) doesn't ask for a
 * specific level — the deck's truth pool is what ran out, so that's what to refill. */
export function pickRandomTruthLevel(): Level {
  return TRUTH_LEVELS[Math.floor(Math.random() * TRUTH_LEVELS.length)];
}

export function buildPrompt(context: PromptContext, level: Level): string {
  // `level` is a closed union fully covered by LEVEL_META.
  // eslint-disable-next-line security/detect-object-injection
  const meta = LEVEL_META[level];
  const kind = level === "dare" ? "a dare" : "a truth question";
  const avoid = [context.summary, ...context.recentQuestions].filter(Boolean);
  const avoidList = avoid.map((item) => `- ${item}`).join("\n");

  return [
    `Generate ${kind} for a couple's "truth or dare" game.`,
    `Intensity level: ${meta.label}.`,
    `Follow these game rules:\n${GAME_RULES}`,
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
