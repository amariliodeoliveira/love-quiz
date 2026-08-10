import { google } from "@ai-sdk/google";

/**
 * Calls Google's Generative AI API directly (GOOGLE_GENERATIVE_AI_API_KEY in .env.local)
 * instead of going through the Vercel AI Gateway — the Gateway requires a credit card
 * on file even to use its free tier, while Google's own free tier for this model
 * doesn't require one. AI_MODEL_ID also gets stored on ai_cards.model, so it doubles as
 * the human-readable label for "which model generated this".
 *
 * Uses the "-latest" alias (rather than a pinned version like "gemini-2.5-flash-lite")
 * because pinned Gemini model ids get retired for new API keys over time — Google keeps
 * this alias pointed at whichever flash-lite generation is currently available.
 */
export const AI_MODEL_ID = "gemini-flash-lite-latest";
export const aiModel = google(AI_MODEL_ID);
