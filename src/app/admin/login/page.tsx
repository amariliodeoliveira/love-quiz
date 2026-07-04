"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Incorrect password");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="admin-login-page">
      <h1 className="admin-title">Admin</h1>
      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="admin-input"
        />
        {error && <p className="admin-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="admin-button"
          style={{ width: "100%" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
