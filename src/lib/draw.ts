/**
 * Picks a uniformly random item from `pool`, or null if it's empty. Takes an injectable
 * `random` (defaulting to `Math.random`) so the selection is deterministically testable.
 */
export function pickRandomItem<T>(
  pool: T[],
  random: () => number = Math.random,
): T | null {
  if (pool.length === 0) return null;
  const randomValue = random();
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
    throw new RangeError("random() must return a finite value in [0, 1)");
  }
  const index = Math.floor(randomValue * pool.length);
  // `index` is bounded above; this is array access, not object injection.
  // eslint-disable-next-line security/detect-object-injection
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
