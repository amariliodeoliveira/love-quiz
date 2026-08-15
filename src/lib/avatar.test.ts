import { describe, expect, it } from "vitest";

import { AVATAR_COLORS, avatarColorHex, isAvatarColorName } from "./avatar";

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
