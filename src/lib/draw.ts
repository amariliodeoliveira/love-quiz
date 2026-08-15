/**
 * Picks a uniformly random item from `pool`, or null if it's empty. Takes an injectable
 * `random` (defaulting to `Math.random`) so the selection is deterministically testable.
 */
export function pickRandomItem<T>(
  pool: T[],
  random: () => number = Math.random,
): T | null {
  if (pool.length === 0) return null;
  const index = Math.floor(random() * pool.length);
  return pool[index];
}

/**
 * Picks the next dare to show, avoiding an immediate repeat of `excludeId` — unless it's
 * the only dare available, in which case repeating it is unavoidable. Returns null if
 * `dares` itself is empty; the caller decides what to do when there are none (e.g. hide
 * the "draw a dare" action rather than offering a button that can never do anything).
 */
export function pickNextDare<T extends { id: string }>(
  dares: T[],
  excludeId?: string,
  random: () => number = Math.random,
): T | null {
  const pool =
    excludeId && dares.length > 1
      ? dares.filter((d) => d.id !== excludeId)
      : dares;
  return pickRandomItem(pool, random);
}
