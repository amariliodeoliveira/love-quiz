import { z } from "zod";

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 128;
const MAX_CURRENT_PASSWORD_LENGTH = 1024;

/** Password policy for every point where an account first chooses a password. */
export const newPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `Use at most ${MAX_PASSWORD_LENGTH} characters`)
  .refine((value) => value.trim().length > 0, {
    message: "New password cannot be only whitespace",
  });

/** Shared by the browser for immediate feedback and the server for input parsing. */
export const passwordChangeFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Enter your current password")
      .max(MAX_CURRENT_PASSWORD_LENGTH, "Current password is too long"),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .superRefine(({ currentPassword, newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New passwords do not match",
        path: ["confirmPassword"],
      });
    }
    if (newPassword === currentPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New password must be different from the current password",
        path: ["newPassword"],
      });
    }
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeFormSchema>;

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export type PasswordChangeParseResult =
  { ok: true; value: PasswordChange } | { ok: false; error: string };

export function parsePasswordChange(body: unknown): PasswordChangeParseResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const { currentPassword, newPassword, confirmPassword } = body as Record<
    string,
    unknown
  >;
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    return { ok: false, error: "All password fields are required" };
  }

  const parsed = passwordChangeFormSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path[0] === "currentPassword") {
      return { ok: false, error: "Current password is too long" };
    }
    if (issue.path[0] === "confirmPassword") {
      return { ok: false, error: "New passwords do not match" };
    }
    if (issue.message === "New password cannot be only whitespace") {
      return { ok: false, error: issue.message };
    }
    if (
      issue.message ===
      "New password must be different from the current password"
    ) {
      return { ok: false, error: issue.message };
    }
    return {
      ok: false,
      error: `New password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    };
  }

  return { ok: true, value: { currentPassword, newPassword } };
}
