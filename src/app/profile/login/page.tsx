"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "../_components/FormField";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/profile/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Incorrect username or password");
      return;
    }

    router.push("/profile");
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
