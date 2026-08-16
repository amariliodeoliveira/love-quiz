import { describe, expect, it } from "vitest";

import { loginFormSchema } from "./login";
import { passwordInputPolicy } from "./password";

describe("loginFormSchema", () => {
  it("requires an explicit remember-device choice", () => {
    expect(
      loginFormSchema.safeParse({ username: "alice", password: "secret" }),
    ).toMatchObject({ success: false });
  });

  it("rejects a password above the request limit", () => {
    expect(
      loginFormSchema.safeParse({
        username: "alice",
        password: "a".repeat(passwordInputPolicy.maxLength + 1),
      }).success,
    ).toBe(false);
  });
});
