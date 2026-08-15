import { describe, expect, it } from "vitest";

import { isSafeRedirectTarget } from "./url";

describe("isSafeRedirectTarget", () => {
  it("accepts a same-origin absolute path", () => {
    expect(isSafeRedirectTarget("/truth-or-dare")).toBe(true);
  });

  it("rejects null", () => {
    expect(isSafeRedirectTarget(null)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isSafeRedirectTarget("")).toBe(false);
  });

  it("rejects a protocol-relative URL (open redirect via //)", () => {
    expect(isSafeRedirectTarget("//evil.com")).toBe(false);
  });

  it("rejects an absolute external URL", () => {
    expect(isSafeRedirectTarget("https://evil.com")).toBe(false);
  });

  it("rejects a path with no leading slash", () => {
    expect(isSafeRedirectTarget("evil.com")).toBe(false);
  });
});
