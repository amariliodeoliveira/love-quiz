"use client";

import { useState } from "react";
import { ALL_LEVELS, LEVEL_META, type Level } from "@/data/cards";
import type { DbCard, Session } from "@/lib/db";
import CardFormModal from "./CardFormModal";
import ConfirmModal from "./ConfirmModal";

export default function ProfileDashboard({
  initialCards,
  session,
}: {
  initialCards: DbCard[];
  session: Session;
}) {
  const [cards, setCards] = useState<DbCard[]>(initialCards);
  const [formCard, setFormCard] = useState<DbCard | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DbCard | null>(null);

  async function handleFormSubmit(level: Level, question: string) {
    if (formCard === "new") {
      const res = await fetch("/api/profile/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, question }),
      });
      if (res.ok) {
        const { card } = await res.json();
        setCards((prev) => [...prev, card]);
      }
    } else if (formCard) {
      const res = await fetch(`/api/profile/cards/${formCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, question }),
      });
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) => (c.id === formCard.id ? { ...c, level, question } : c)),
        );
      }
    }
    setFormCard(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/profile/cards/${pendingDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== pendingDelete.id));
    }
    setPendingDelete(null);
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="page-title">Deck Studio</h1>
        <p className="text-muted dashboard-subtitle">
          {session.role === "admin" ? "Seeing all cards" : "Seeing only your cards"}
        </p>
        <button onClick={() => setFormCard("new")} className="btn">
          + Add card
        </button>
      </div>

      <div>
        {ALL_LEVELS.map((lvl) => {
          const meta = LEVEL_META[lvl];
          const levelCards = cards.filter((c) => c.level === lvl);
          return (
            <div key={lvl} className="dashboard-level-group">
              <h2 className="dashboard-level-title">
                {meta.emoji} {meta.label} ({levelCards.length})
              </h2>
              {levelCards.map((card) => (
                <div key={card.id} className="dashboard-card-row">
                  <p className="dashboard-card-question">{card.question}</p>
                  <div className="dashboard-card-actions">
                    <button onClick={() => setFormCard(card)} className="btn-ghost">
                      Edit
                    </button>
                    <button
                      onClick={() => setPendingDelete(card)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {formCard !== null && (
        <CardFormModal
          key={formCard === "new" ? "new" : formCard.id}
          card={formCard === "new" ? undefined : formCard}
          onClose={() => setFormCard(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete card"
        message="Are you sure you want to delete this card? This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
