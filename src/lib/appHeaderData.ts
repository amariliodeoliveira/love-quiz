import { unstable_cache } from "next/cache";
import { getSession } from "@/lib/auth";
import { getUserById, getCountdown, type DbUser } from "@/lib/db";
import { toCountdownDisplay, type CountdownDisplay } from "@/lib/countdown";

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
 * Fetches the (user, countdown) pair every AppHeader-rendering layout needs. Centralized
 * here so no call site can shortcut/skip fetching the real countdown for a given route —
 * that shortcut previously caused /truth-or-dare/game to hardcode countdown=null, which
 * silently broke the avatar menu's "Edit countdown" state and risked overwriting the real
 * shared countdown. Every layout should call this instead of fetching session/user/countdown
 * itself, even if it doesn't render the countdown ticker.
 */
export async function getAppHeaderData(): Promise<{
  user: Pick<DbUser, "username" | "avatarColor"> | null;
  countdown: CountdownDisplay | null;
}> {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;
  const countdown = session ? await getCachedCountdownDisplay() : null;
  return { user, countdown };
}
