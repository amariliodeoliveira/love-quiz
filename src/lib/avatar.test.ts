import { describe, expect, it } from "vitest";

import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  avatarColorHex,
  avatarInitial,
  isAvatarColorName,
  isAvatarEmoji,
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

  it("rejects empty/whitespace-only strings, overly long strings, and non-string values", () => {
    expect(isAvatarEmoji("")).toBe(false);
    expect(isAvatarEmoji("   ")).toBe(false);
    expect(isAvatarEmoji("🐶".repeat(9))).toBe(false);
    expect(isAvatarEmoji(undefined)).toBe(false);
    expect(isAvatarEmoji(42)).toBe(false);
  });
});
