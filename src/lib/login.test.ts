import { describe, expect, it } from "vitest";

import { loginFormSchema } from "./login";
import { passwordInputPolicy } from "./password";

describe("loginFormSchema", () => {
  it("defaults rememberMe to false", () => {
    expect(
      loginFormSchema.parse({ username: "alice", password: "secret" }),
    ).toMatchObject({ rememberMe: false });
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
