"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { patchJson } from "@/lib/http";
import {
  passwordChangeFormSchema,
  type PasswordChangeFormValues,
  passwordPolicy,
} from "@/lib/password";

import FormField from "./FormField";
import TextField from "./TextField";

export default function ChangePasswordForm({
  onBack,
  onChanged,
}: {
  onBack: () => void;
  onChanged: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeFormSchema),
    mode: "onTouched",
  });

  async function submit(values: PasswordChangeFormValues) {
    try {
      const { ok, data } = await patchJson<{ error?: string }>(
        "/api/profile/password",
        values,
      );
      if (ok) {
        onChanged();
        return;
      }

      const message =
        data?.error ??
        "Couldn't change your password — check your connection and try again.";
      setError(
        message === "Current password is incorrect"
          ? "currentPassword"
          : "root",
        { message },
      );
    } catch {
      setError("root", {
        message:
          "Couldn't change your password — check your connection and try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="modal-form" noValidate>
      <button
        type="button"
        className="btn-ghost self-start"
        onClick={onBack}
        disabled={isSubmitting}
      >
        ← Back to profile settings
      </button>
      <p className="text-subtext text-sm">
        Confirm your current password, then choose a new one.
      </p>

      <FormField
        id="current-password"
        label="Current password"
        error={errors.currentPassword?.message}
      >
        <TextField
          id="current-password"
          type="password"
          placeholder="Enter your current password"
          autoComplete="current-password"
          maxLength={1024}
          aria-invalid={errors.currentPassword ? "true" : undefined}
          aria-describedby={
            errors.currentPassword ? "current-password-error" : undefined
          }
          {...register("currentPassword")}
        />
      </FormField>

      <FormField
        id="new-password"
        label="New password"
        hint={`Use ${passwordPolicy.minLength} to ${passwordPolicy.maxLength} characters. A memorable passphrase works well.`}
        error={errors.newPassword?.message}
      >
        <TextField
          id="new-password"
          type="password"
          placeholder="Create a new password"
          autoComplete="new-password"
          minLength={passwordPolicy.minLength}
          maxLength={passwordPolicy.maxLength}
          aria-invalid={errors.newPassword ? "true" : undefined}
          aria-describedby={
            errors.newPassword ? "new-password-error" : "new-password-hint"
          }
          {...register("newPassword")}
        />
      </FormField>

      <FormField
        id="confirm-password"
        label="Confirm new password"
        error={errors.confirmPassword?.message}
      >
        <TextField
          id="confirm-password"
          type="password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          minLength={passwordPolicy.minLength}
          maxLength={passwordPolicy.maxLength}
          aria-invalid={errors.confirmPassword ? "true" : undefined}
          aria-describedby={
            errors.confirmPassword ? "confirm-password-error" : undefined
          }
          {...register("confirmPassword")}
        />
      </FormField>

      {errors.root?.message && (
        <p className="form-error" role="alert">
          {errors.root.message}
        </p>
      )}
      <div className="modal-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? "Changing password..." : "Change password"}
        </button>
      </div>
    </form>
  );
}
