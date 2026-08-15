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

/** First displayable character of a name, for the avatar badge's fallback — used only
 * when the user hasn't picked an avatar emoji. Uses `[...name]` (iterates by Unicode
 * code point) rather than `name.charAt(0)` — most emoji are surrogate pairs in JS
 * strings, so `charAt(0)` grabs only half of one and renders as a broken glyph instead
 * of the whole emoji. */
export function avatarInitial(name: string): string {
  const [first] = [...name.trim()];
  return first ? first.toUpperCase() : "?";
}

// 20 items + the "+" custom-emoji slot fills exactly 3 rows of 7 in the picker grid —
// see EditProfileModal's .avatar-emoji-grid. Keep it at 20 if you add/remove one.
export const AVATAR_EMOJIS = [
  "🐝",
  "🦩",
  "🌙",
  "⭐",
  "😀",
  "😍",
  "😎",
  "🥰",
  "🤓",
  "🐶",
  "🐱",
  "🦊",
  "🐻",
  "🐼",
  "🦁",
  "🐸",
  "🐙",
  "🌸",
  "🌵",
  "🍀",
] as const;

/** Beyond the curated list above, a user can pick any emoji via their OS/browser's own
 * emoji picker (see EditProfileModal's "+" option) — so this can't be a membership
 * check against AVATAR_EMOJIS. Instead it's a light sanity check: a handful of Unicode
 * code points (covers multi-codepoint sequences like skin-tone modifiers or ZWJ
 * combos), and not plain ASCII text (a stray pasted word shouldn't pass as an emoji). */
export function isAvatarEmoji(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const codePoints = [...trimmed];
  if (codePoints.length === 0 || codePoints.length > 8) return false;
  return codePoints.some((c) => c.codePointAt(0)! > 127);
}
