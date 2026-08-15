import { unstable_cache } from "next/cache";
import { cache } from "react";

import { getSession } from "@/lib/auth";
import { type CountdownDisplay, toCountdownDisplay } from "@/lib/countdown";
import { type DbUser, getCountdown, getUserById } from "@/lib/db";

/**
 * Countdown reads happen on every page load/refresh but writes are rare (an occasional
 * manual edit), so this is cached for a short window to avoid a Postgres round-trip on
 * every navigation. The write path (PATCH /api/countdown) calls revalidateTag("countdown")
 * so an edit is reflected immediately regardless of the TTL below.
 *
 * Caches the already-shaped CountdownDisplay (plain strings/numbers) rather than the raw
 * DB row — unstable_cache serializes its return value, and a `Date` wouldn't survive that
 * round-trip as a `Date`. The few seconds of msRemaining staleness this can introduce is
 * imperceptible for a multi-day countdown; the client ticks it forward locally anyway.
 */
const getCachedCountdownDisplay = unstable_cache(
  async () => toCountdownDisplay(await getCountdown()),
  ["countdown-display"],
  { tags: ["countdown"], revalidate: 15 },
);

/**
 * The signed-in user's full row, deduped per request with React's `cache()` — both
 * RootLayout (for the `<html data-theme>` it needs before anything else renders) and
 * getAppHeaderData below (for the header) call this, and this way they only cost one
 * Postgres round-trip between them instead of one each.
 */
export const getSessionUser = cache(async (): Promise<DbUser | null> => {
  const session = await getSession();
  return session ? await getUserById(session.userId) : null;
});

/**
 * Fetches the (user, countdown) pair every AppHeader-rendering layout needs. Centralized
 * here so no call site can shortcut/skip fetching the real countdown for a given route —
 * that shortcut previously caused /truth-or-dare/game to hardcode countdown=null, which
 * silently broke the avatar menu's "Edit countdown" state and risked overwriting the real
 * shared countdown. Every layout should call this instead of fetching session/user/countdown
 * itself, even if it doesn't render the countdown ticker.
 */
export async function getAppHeaderData(): Promise<{
  user: Pick<
    DbUser,
    "username" | "displayName" | "avatarColor" | "theme"
  > | null;
  countdown: CountdownDisplay | null;
}> {
  const user = await getSessionUser();
  const countdown = user ? await getCachedCountdownDisplay() : null;
  return { user, countdown };
}
