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
/** The picker reserves its first of 30 visual slots for the add-emoji control. */
export const MAX_AVATAR_EMOJI_OPTIONS = 29;

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

/** Curated defaults for the avatar picker. Add new choices only at the end so the
 * familiar order stays stable for existing users. */
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
  "🐰",
  "🐨",
  "🦄",
  "🦋",
  "🐬",
  "🦖",
  "🍓",
  "🌈",
  "🎵",
] as const;

/**
 * Produces the picker list from a stored MRU list and the curated fallback choices.
 * Stored items stay first; duplicates are removed so one selection always maps to one
 * visual slot. A full list intentionally does not admit later defaults: preserving a
 * person's recent choices is less surprising than evicting one for a catalog update.
 */
export function mergeAvatarEmojiOptions(
  options: readonly string[] | null,
): string[] {
  if (!options) return [...AVATAR_EMOJIS];
  const uniqueOptions = [...new Set(options)];
  const missingDefaults = AVATAR_EMOJIS.filter(
    (emoji) => !uniqueOptions.includes(emoji),
  );
  return [...uniqueOptions, ...missingDefaults].slice(
    0,
    MAX_AVATAR_EMOJI_OPTIONS,
  );
}

/** Records an avatar choice using most-recently-used ordering. The selected emoji is
 * always first, appears once, and displaces the least-recent item when the picker is
 * full. Both built-in and custom choices must use this function. */
export function recordAvatarEmojiSelection(
  options: readonly string[] | null,
  selectedEmoji: string,
): string[] {
  return [
    selectedEmoji,
    ...mergeAvatarEmojiOptions(options).filter(
      (emoji) => emoji !== selectedEmoji,
    ),
  ].slice(0, MAX_AVATAR_EMOJI_OPTIONS);
}

/** Beyond the curated list above, a user can pick any emoji via their OS/browser's own
 * emoji picker (see EditProfileModal's "+" option) — so this can't be a membership
 * check against AVATAR_EMOJIS. A single grapheme allows compound emoji (skin tones and
 * ZWJ sequences) while rejecting plain text and multiple emoji. */
export function isAvatarEmoji(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  const graphemes = [
    ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
      trimmed,
    ),
  ];
  return (
    graphemes.length === 1 &&
    /[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3]/u.test(trimmed)
  );
}
