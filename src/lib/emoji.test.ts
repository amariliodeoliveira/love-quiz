import { describe, expect, it } from "vitest";

import { emojiHtml } from "./emoji";

describe("emojiHtml", () => {
  it("escapes HTML-special characters before anything else runs", () => {
    const html = emojiHtml("<script>alert(\"hi\")</script> & 'quote'");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;");
    expect(html).toContain("&#39;");
  });

  it("escapes ampersand before the other entities, so entities aren't double-escaped", () => {
    // If '&' were escaped after '<', "&lt;" would itself become "&amp;lt;".
    const html = emojiHtml("<");
    expect(html).toBe("&lt;");
  });

  it("replaces an emoji with a twemoji <img>, leaving plain text untouched", () => {
    const html = emojiHtml("hi 😀 there");
    expect(html).toContain("hi ");
    expect(html).toContain(" there");
    expect(html).toContain("<img");
    expect(html).toContain('class="emoji"');
    expect(html).toContain('alt="😀"');
  });

  it("returns escaped plain text unchanged when there is no emoji", () => {
    expect(emojiHtml("just plain text")).toBe("just plain text");
  });

  it("handles an empty string", () => {
    expect(emojiHtml("")).toBe("");
  });
});
