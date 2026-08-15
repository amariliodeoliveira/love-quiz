export const AVATAR_COLORS = [
  { name: "pink", hex: "#f4c6d7" },
  { name: "blue", hex: "#c3d9f0" },
  { name: "green", hex: "#c6e8d1" },
  { name: "yellow", hex: "#f2e6b3" },
  { name: "purple", hex: "#d9c9ee" },
  { name: "orange", hex: "#f2d0b3" },
] as const;

export type AvatarColorName = (typeof AVATAR_COLORS)[number]["name"];

export const DEFAULT_AVATAR_COLOR: AvatarColorName = "pink";

export function isAvatarColorName(value: unknown): value is AvatarColorName {
  return AVATAR_COLORS.some((c) => c.name === value);
}

export function avatarColorHex(name: string): string {
  return (
    AVATAR_COLORS.find((c) => c.name === name)?.hex ?? AVATAR_COLORS[0].hex
  );
}

/** First displayable character of a name, for the avatar badge's fallback initial.
 * Uses `[...name]` (iterates by Unicode code point) rather than `name.charAt(0)` —
 * most emoji are surrogate pairs in JS strings, so `charAt(0)` grabs only half of one
 * and renders as a broken glyph instead of the whole emoji. */
export function avatarInitial(name: string): string {
  const [first] = [...name.trim()];
  return first ? first.toUpperCase() : "?";
}
