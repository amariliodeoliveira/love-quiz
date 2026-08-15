import { describe, expect, it } from "vitest";

import { DEFAULT_THEME, isThemeName, THEMES } from "./theme";

describe("isThemeName", () => {
  it("accepts every known theme name", () => {
    for (const { name } of THEMES) {
      expect(isThemeName(name)).toBe(true);
    }
  });

  it("rejects unknown or non-string values", () => {
    expect(isThemeName("chartreuse")).toBe(false);
    expect(isThemeName(undefined)).toBe(false);
    expect(isThemeName(42)).toBe(false);
  });
});

describe("DEFAULT_THEME", () => {
  it("is one of the known themes", () => {
    expect(THEMES.some((t) => t.name === DEFAULT_THEME)).toBe(true);
  });
});
