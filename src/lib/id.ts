/** Parses a route param into a strictly-integer id, or null if it isn't one. */
export function parseId(value: string): number | null {
  if (value.trim() === "") return null;
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}
