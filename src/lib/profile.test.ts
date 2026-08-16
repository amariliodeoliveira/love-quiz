import { describe, expect, it } from "vitest";

import { parseProfileUpdate } from "./profile";

describe("parseProfileUpdate", () => {
  it.each([null, [], "profile", 42])(
    "rejects a non-object request body: %j",
    (body) => {
      expect(parseProfileUpdate(body)).toEqual({
        ok: false,
        error: "Invalid request body",
      });
    },
  );

  it("parses supported fields from a valid object", () => {
    expect(
      parseProfileUpdate({
        displayName: "  Alice  ",
        avatarEmoji: "🎉",
        theme: "dark",
      }),
    ).toEqual({
      ok: true,
      fields: {
        displayName: "Alice",
        avatarEmoji: "🎉",
        theme: "dark",
      },
    });
  });

  it("rejects an invalid supported field", () => {
    expect(parseProfileUpdate({ displayName: "a".repeat(41) })).toEqual({
      ok: false,
      error: "Invalid display name",
    });
  });

  it("rejects duplicated avatar emoji options", () => {
    expect(parseProfileUpdate({ avatarEmojiOptions: ["🐝", "🐝"] })).toEqual({
      ok: false,
      error: "Invalid emoji options",
    });
  });

  it("ignores unsupported fields", () => {
    expect(parseProfileUpdate({ admin: true })).toEqual({
      ok: true,
      fields: {},
    });
  });
});
