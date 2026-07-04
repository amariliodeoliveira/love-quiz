"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVEL_META, type Level } from "@/data/cards";
import type { DbCard } from "@/lib/db";

export default function AdminPage() {
  const router = useRouter();
  const [cards, setCards] = useState<DbCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<Level>("1");
  const [question, setQuestion] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCards() {
    setLoading(true);
    const res = await fetch("/api/admin/cards");
    if (res.ok) {
      const data = await res.json();
      setCards(data.cards);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCards();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setSaving(true);
    const res = await fetch("/api/admin/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, question }),
    });
    setSaving(false);

    if (res.ok) {
      setQuestion("");
      loadCards();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this card?")) return;
    const res = await fetch(`/api/admin/cards/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24 }}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ cursor: "pointer" }}>
          Log out
        </button>
      </div>

      <form
        onSubmit={handleAdd}
        style={{ marginBottom: 32, display: "flex", gap: 8 }}
      >
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          style={{ padding: 8, borderRadius: 8 }}
        >
          {Object.entries(LEVEL_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.emoji} {meta.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="New question or dare..."
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          disabled={saving}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {saving ? "Saving..." : "Add"}
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {(["1", "2", "3", "dare"] as Level[]).map((lvl) => {
            const meta = LEVEL_META[lvl];
            const levelCards = cards.filter((c) => c.level === lvl);
            return (
              <div key={lvl} style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>
                  {meta.emoji} {meta.label} ({levelCards.length})
                </h2>
                {levelCards.map((card) => (
                  <div
                    key={card.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14 }}>{card.question}</p>
                    <button
                      onClick={() => handleDelete(card.id)}
                      style={{ color: "red", cursor: "pointer", flexShrink: 0 }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}