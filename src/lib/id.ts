/** Parses a route param into a strictly-integer id, or null if it isn't one. */
export function parseId(value: string): number | null {
  if (value.trim() === "") return null;
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export interface CardRef {
  source: "manual" | "ai";
  id: number;
}

/**
 * Parses a game-pool card id into which table it belongs to. AI-generated cards are
 * prefixed `ai-<id>` (see getGameCards in src/lib/db.ts) to disambiguate from the plain
 * numeric ids `cards` uses — this is the single place that decodes that prefix.
 */
export function parseCardRef(value: string): CardRef | null {
  if (value.startsWith("ai-")) {
    const id = parseId(value.slice(3));
    return id === null ? null : { source: "ai", id };
  }
  const id = parseId(value);
  return id === null ? null : { source: "manual", id };
}
