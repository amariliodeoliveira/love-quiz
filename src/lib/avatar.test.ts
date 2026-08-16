import { describe, expect, it } from "vitest";

import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  avatarColorHex,
  avatarInitial,
  isAvatarColorName,
  isAvatarEmoji,
  MAX_AVATAR_EMOJI_OPTIONS,
  mergeAvatarEmojiOptions,
  recordAvatarEmojiSelection,
} from "./avatar";

describe("isAvatarColorName", () => {
  it("accepts every known color name", () => {
    for (const { name } of AVATAR_COLORS) {
      expect(isAvatarColorName(name)).toBe(true);
    }
  });

  it("rejects unknown or non-string values", () => {
    expect(isAvatarColorName("chartreuse")).toBe(false);
    expect(isAvatarColorName(undefined)).toBe(false);
    expect(isAvatarColorName(42)).toBe(false);
  });
});

describe("avatarColorHex", () => {
  it("returns the matching hex for a known color", () => {
    expect(avatarColorHex("blue")).toBe(
      AVATAR_COLORS.find((c) => c.name === "blue")?.hex,
    );
  });

  it("falls back to the first color for an unknown name", () => {
    expect(avatarColorHex("not-a-color")).toBe(AVATAR_COLORS[0].hex);
  });
});

describe("avatarInitial", () => {
  it("uppercases the first letter of a plain name", () => {
    expect(avatarInitial("barnes")).toBe("B");
  });

  it("trims leading whitespace before taking the first character", () => {
    expect(avatarInitial("  mingo")).toBe("M");
  });

  it("returns a leading emoji whole, instead of a broken surrogate half", () => {
    // '🎂' is a surrogate pair — charAt(0) would return an unpaired half that renders
    // as a broken glyph. This must return the whole emoji.
    expect(avatarInitial("🎂 Bee")).toBe("🎂");
  });

  it("falls back to a placeholder for an empty name", () => {
    expect(avatarInitial("")).toBe("?");
    expect(avatarInitial("   ")).toBe("?");
  });
});

describe("isAvatarEmoji", () => {
  it("accepts every emoji in the curated list", () => {
    for (const emoji of AVATAR_EMOJIS) {
      expect(isAvatarEmoji(emoji)).toBe(true);
    }
  });

  it("accepts an emoji outside the curated list (picked via the OS emoji picker)", () => {
    expect(isAvatarEmoji("🦄")).toBe(true);
  });

  it("rejects plain ASCII text", () => {
    expect(isAvatarEmoji("ab")).toBe(false);
    expect(isAvatarEmoji("42")).toBe(false);
  });

  it("rejects text, a broken surrogate, multiple emoji, and non-string values", () => {
    expect(isAvatarEmoji("")).toBe(false);
    expect(isAvatarEmoji("   ")).toBe(false);
    expect(isAvatarEmoji("猫")).toBe(false);
    expect(isAvatarEmoji("\uD83E")).toBe(false);
    expect(isAvatarEmoji("🐶🐱")).toBe(false);
    expect(isAvatarEmoji(undefined)).toBe(false);
    expect(isAvatarEmoji(42)).toBe(false);
  });

  it("accepts a compound emoji as one grapheme", () => {
    expect(isAvatarEmoji("👩🏽‍💻")).toBe(true);
  });
});

describe("mergeAvatarEmojiOptions", () => {
  it("returns the complete curated list for a user without personal options", () => {
    expect(mergeAvatarEmojiOptions(null)).toEqual(AVATAR_EMOJIS);
  });

  it("preserves custom ordering and appends only missing defaults", () => {
    expect(mergeAvatarEmojiOptions(["🦄", "🐝"])).toEqual([
      "🦄",
      "🐝",
      ...AVATAR_EMOJIS.filter((emoji) => emoji !== "🐝" && emoji !== "🦄"),
    ]);
  });

  it("does not displace a full personal list", () => {
    const personalOptions = Array.from(
      { length: MAX_AVATAR_EMOJI_OPTIONS },
      (_, index) => `custom-${index}`,
    );
    expect(mergeAvatarEmojiOptions(personalOptions)).toEqual(personalOptions);
  });

  it("removes duplicates while retaining the first, most-recent occurrence", () => {
    expect(mergeAvatarEmojiOptions(["🦄", "🐝", "🦄"])).toEqual([
      "🦄",
      "🐝",
      ...AVATAR_EMOJIS.filter((emoji) => emoji !== "🦄" && emoji !== "🐝"),
    ]);
  });
});

describe("recordAvatarEmojiSelection", () => {
  it("moves an existing selection to the front without duplicating it", () => {
    expect(recordAvatarEmojiSelection(["🐝", "🦩", "🌙"], "🌙")).toEqual([
      "🌙",
      "🐝",
      "🦩",
      ...AVATAR_EMOJIS.filter((emoji) => !["🐝", "🦩", "🌙"].includes(emoji)),
    ]);
  });

  it("prepends a new custom emoji and evicts the least-recent item at capacity", () => {
    const fullOptions = Array.from(
      { length: MAX_AVATAR_EMOJI_OPTIONS },
      (_, index) => `emoji-${index}`,
    );

    const recorded = recordAvatarEmojiSelection(fullOptions, "🦉");

    expect(recorded).toHaveLength(MAX_AVATAR_EMOJI_OPTIONS);
    expect(recorded[0]).toBe("🦉");
    expect(recorded).not.toContain("emoji-28");
  });
});
