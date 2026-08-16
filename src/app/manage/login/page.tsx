"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { postJson } from "@/lib/http";
import { GAME_PATH } from "@/lib/routes";
import { isSafeRedirectTarget } from "@/lib/url";

import FormField from "../../_components/FormField";
import TextField from "../../_components/TextField";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { ok, data } = await postJson<{ error?: string }>(
      "/api/profile/login",
      { username, password, rememberMe },
    );

    setLoading(false);

    if (!ok) {
      setError(data?.error ?? "Incorrect username or password");
      return;
    }

    const from = searchParams.get("from");
    router.push(isSafeRedirectTarget(from) ? from : GAME_PATH);
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="login-card">
        <h1 className="page-title">Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <FormField id="username" label="Username">
            <TextField
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
            />
          </FormField>
          <FormField id="password" label="Password">
            <TextField
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </FormField>
          <label className="text-subtext flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-purple"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Keep me signed in for 30 days
          </label>
          <p className="login-hint">
            First time logging in? The password you enter now will be saved as
            yours.
          </p>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-block">
            {loading ? "Signing in..." : "Sign in"}
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
