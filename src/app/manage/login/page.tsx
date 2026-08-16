"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";

import { postJson } from "@/lib/http";
import { loginFormSchema, type LoginFormValues } from "@/lib/login";
import { GAME_PATH } from "@/lib/routes";
import { isSafeRedirectTarget } from "@/lib/url";

import FormField from "../../_components/FormField";
import TextField from "../../_components/TextField";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: "", password: "", rememberMe: false },
  });

  async function submit(values: LoginFormValues) {
    try {
      const { ok, data } = await postJson<{ error?: string }>(
        "/api/profile/login",
        values,
      );

      if (ok) {
        const from = searchParams.get("from");
        router.push(isSafeRedirectTarget(from) ? from : GAME_PATH);
        router.refresh();
        return;
      }
      setError("root", {
        message: data?.error ?? "Incorrect username or password",
      });
    } catch {
      setError("root", {
        message: "Couldn't sign in — check your connection and try again.",
      });
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="login-card">
        <h1 className="page-title">Login</h1>
        <form onSubmit={handleSubmit(submit)} className="login-form" noValidate>
          <FormField
            id="username"
            label="Username"
            error={errors.username?.message}
          >
            <TextField
              id="username"
              placeholder="Enter your username"
              autoComplete="username"
              aria-invalid={errors.username ? "true" : undefined}
              aria-describedby={errors.username ? "username-error" : undefined}
              {...register("username")}
            />
          </FormField>
          <FormField
            id="password"
            label="Password"
            error={errors.password?.message}
          >
            <TextField
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : undefined}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
          </FormField>
          <label className="text-subtext flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-purple"
              {...register("rememberMe")}
            />
            Keep me signed in for 30 days
          </label>
          <p className="login-hint">
            First time logging in? The password you enter now will be saved as
            yours.
          </p>
          {errors.root?.message && (
            <p className="form-error" role="alert">
              {errors.root.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-block"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
