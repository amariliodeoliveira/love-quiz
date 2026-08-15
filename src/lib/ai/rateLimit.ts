/** Minimum time between AI generations, shared across both users since the deck (and the
 * Gemini quota it spends) is shared too. Coarse but cheap: no per-user tracking needed
 * (ai_cards has no user_id — nobody "owns" a generated question), just enough to stop a
 * client from hammering the endpoint (accidentally or by directly calling the API,
 * bypassing the UI's own aiLoading guard). */
export const AI_GENERATE_COOLDOWN_SECONDS = 10;

export function isAiGenerateRateLimited(
  lastGeneratedAt: Date | null,
  now: Date,
): boolean {
  if (!lastGeneratedAt) return false;
  const elapsedSeconds = (now.getTime() - lastGeneratedAt.getTime()) / 1000;
  return elapsedSeconds < AI_GENERATE_COOLDOWN_SECONDS;
}
