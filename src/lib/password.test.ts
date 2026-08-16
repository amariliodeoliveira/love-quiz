import { describe, expect, it } from "vitest";

import {
  isPasswordInputTooLong,
  parsePasswordChange,
  passwordInputPolicy,
  passwordPolicy,
} from "./password";

const validChange = {
  currentPassword: "current password",
  newPassword: "a memorable new passphrase",
  confirmPassword: "a memorable new passphrase",
};

describe("parsePasswordChange", () => {
  it("rejects password input above the shared request limit", () => {
    expect(
      isPasswordInputTooLong("a".repeat(passwordInputPolicy.maxLength)),
    ).toBe(false);
    expect(
      isPasswordInputTooLong("a".repeat(passwordInputPolicy.maxLength + 1)),
    ).toBe(true);
  });

  it.each([null, [], "password", 42])(
    "rejects a non-object request body: %j",
    (body) => {
      expect(parsePasswordChange(body)).toEqual({
        ok: false,
        error: "Invalid request body",
      });
    },
  );

  it("parses a valid password change", () => {
    expect(parsePasswordChange(validChange)).toEqual({
      ok: true,
      value: {
        currentPassword: "current password",
        newPassword: "a memorable new passphrase",
      },
    });
  });

  it("requires every field", () => {
    expect(
      parsePasswordChange({
        currentPassword: "current password",
        newPassword: "a memorable new passphrase",
      }),
    ).toEqual({ ok: false, error: "All password fields are required" });
  });

  it("rejects an excessively large current password", () => {
    expect(
      parsePasswordChange({
        ...validChange,
        currentPassword: "a".repeat(1025),
      }),
    ).toEqual({
      ok: false,
      error: "Current password is too long",
    });
  });

  it("requires matching new-password confirmation", () => {
    expect(
      parsePasswordChange({ ...validChange, confirmPassword: "different" }),
    ).toEqual({ ok: false, error: "New passwords do not match" });
  });

  it("requires a new password different from the current password", () => {
    expect(
      parsePasswordChange({
        currentPassword: "a memorable passphrase",
        newPassword: "a memorable passphrase",
        confirmPassword: "a memorable passphrase",
      }),
    ).toEqual({
      ok: false,
      error: "New password must be different from the current password",
    });
  });

  it.each([
    "a".repeat(passwordPolicy.minLength - 1),
    "a".repeat(passwordPolicy.maxLength + 1),
  ])("enforces the password length policy: %s", (newPassword) => {
    expect(
      parsePasswordChange({
        currentPassword: "current password",
        newPassword,
        confirmPassword: newPassword,
      }),
    ).toEqual({
      ok: false,
      error: `New password must be between ${passwordPolicy.minLength} and ${passwordPolicy.maxLength} characters`,
    });
  });

  it("accepts a new password at the minimum length", () => {
    const newPassword = "a".repeat(passwordPolicy.minLength);

    expect(
      parsePasswordChange({
        currentPassword: "current password",
        newPassword,
        confirmPassword: newPassword,
      }),
    ).toEqual({
      ok: true,
      value: { currentPassword: "current password", newPassword },
    });
  });

  it("rejects a password made only of whitespace", () => {
    const newPassword = " ".repeat(passwordPolicy.minLength);
    expect(
      parsePasswordChange({
        currentPassword: "current password",
        newPassword,
        confirmPassword: newPassword,
      }),
    ).toEqual({
      ok: false,
      error: "New password cannot be only whitespace",
    });
  });
});
