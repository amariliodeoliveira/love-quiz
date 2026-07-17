/**
 * Picks a uniformly random item from `pool`, or null if it's empty. Takes an injectable
 * `random` (defaulting to `Math.random`) so the selection is deterministically testable.
 */
export function pickRandomItem<T>(pool: T[], random: () => number = Math.random): T | null {
  if (pool.length === 0) return null;
  const index = Math.floor(random() * pool.length);
  return pool[index];
}
