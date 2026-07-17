"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GAME_PATH } from "@/lib/routes";
import { postJson } from "@/lib/http";
import { isSafeRedirectTarget } from "@/lib/url";
import FormField from "../_components/FormField";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { ok, data } = await postJson<{ error?: string }>(
      "/api/profile/login",
      { username, password },
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
    <div className="center-screen">
      <div className="login-card">
        <h1 className="page-title">Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <FormField
            value={username}
            onChange={setUsername}
            placeholder="Username"
            autoFocus
          />
          <FormField
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Password"
          />
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
