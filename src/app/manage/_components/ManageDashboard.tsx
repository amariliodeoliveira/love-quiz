"use client";

import { useMemo, useState } from "react";
import { LEVEL_META, type Level } from "@/data/cards";
import type { DbCard, Session } from "@/lib/db";
import { formatAnsweredAtManila } from "@/lib/datetime";
import { postJson, patchJson } from "@/lib/http";
import ConfirmationModal from "@/app/_components/ConfirmationModal";
import CardFormModal from "./CardFormModal";

type TopTab = "truths" | "dares";
type TruthSubTab = "active" | "history";

const RANK_BADGES = ["🥇", "🥈", "🥉"];

export default function ManageDashboard({
  initialCards,
  session,
}: {
  initialCards: DbCard[];
  session: Session;
}) {
  const [cards, setCards] = useState<DbCard[]>(initialCards);
  const [topTab, setTopTab] = useState<TopTab>("truths");
  const [truthSubTab, setTruthSubTab] = useState<TruthSubTab>("active");
  const [formCard, setFormCard] = useState<DbCard | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DbCard | null>(null);
  const [pendingReactivate, setPendingReactivate] = useState<DbCard | null>(null);

  async function handleFormSubmit(level: Level, question: string) {
    if (formCard === "new") {
      const { ok, data } = await postJson<{ card: DbCard }>("/api/profile/cards", {
        level,
        question,
      });
      if (ok && data) {
        setCards((prev) => [...prev, data.card]);
      }
    } else if (formCard) {
      const { ok } = await patchJson(`/api/profile/cards/${formCard.id}`, {
        level,
        question,
      });
      if (ok) {
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

  async function handleConfirmReactivate() {
    if (!pendingReactivate) return;
    const { ok } = await patchJson(
      `/api/profile/cards/${pendingReactivate.id}/reactivate`,
      {},
    );
    if (ok) {
      setCards((prev) =>
        prev.map((c) => (c.id === pendingReactivate.id ? { ...c, answeredAt: null } : c)),
      );
    }
    setPendingReactivate(null);
  }

  const truths = useMemo(() => cards.filter((c) => c.level !== "dare"), [cards]);
  const activeTruths = truths.filter((c) => c.answeredAt === null);
  const historyTruths = useMemo(
    () =>
      truths
        .filter((c) => c.answeredAt !== null)
        .sort((a, b) => b.answeredAt!.getTime() - a.answeredAt!.getTime()),
    [truths],
  );
  const rankedDares = useMemo(
    () =>
      cards
        .filter((c) => c.level === "dare")
        .sort((a, b) => b.timesCompleted - a.timesCompleted),
    [cards],
  );

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="page-title">Deck Studio</h1>
        <p className="text-subtext dashboard-subtitle">
          {session.role === "admin" ? "Seeing all cards" : "Seeing only your cards"}
        </p>
        <button onClick={() => setFormCard("new")} className="btn">
          + Add card
        </button>
      </div>

      <div className="tabs mb-6" role="group" aria-label="Manage section">
        <button
          type="button"
          className={`tab ${topTab === "truths" ? "active-all" : ""}`}
          aria-pressed={topTab === "truths"}
          onClick={() => setTopTab("truths")}
        >
          Truths
        </button>
        <button
          type="button"
          className={`tab ${topTab === "dares" ? "active-all" : ""}`}
          aria-pressed={topTab === "dares"}
          onClick={() => setTopTab("dares")}
        >
          Dares
        </button>
      </div>

      {topTab === "truths" ? (
        <>
          <div className="tabs mb-6" role="group" aria-label="Truths filter">
            <button
              type="button"
              className={`tab ${truthSubTab === "active" ? "active-all" : ""}`}
              aria-pressed={truthSubTab === "active"}
              onClick={() => setTruthSubTab("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={`tab ${truthSubTab === "history" ? "active-all" : ""}`}
              aria-pressed={truthSubTab === "history"}
              onClick={() => setTruthSubTab("history")}
            >
              History
            </button>
          </div>

          {(truthSubTab === "active" ? activeTruths : historyTruths).map((card) => {
            const meta = LEVEL_META[card.level];
            return (
              <div key={card.id} className="dashboard-card-row">
                <div>
                  <p className="dashboard-card-question">
                    {meta.emoji} {card.question}
                  </p>
                  {card.answeredAt && (
                    <p className="text-xs text-muted">
                      Answered on {formatAnsweredAtManila(card.answeredAt)}
                    </p>
                  )}
                </div>
                <div className="dashboard-card-actions">
                  {truthSubTab === "history" && (
                    <button onClick={() => setPendingReactivate(card)} className="btn-ghost">
                      Reactivate
                    </button>
                  )}
                  <button onClick={() => setFormCard(card)} className="btn-ghost">
                    Edit
                  </button>
                  <button onClick={() => setPendingDelete(card)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        rankedDares.map((card, index) => (
          <div key={card.id} className="dashboard-card-row">
            <p className="dashboard-card-question">
              {index < 3 ? `${RANK_BADGES[index]} ` : ""}
              {card.question} · {card.timesCompleted}x
            </p>
            <div className="dashboard-card-actions">
              <button onClick={() => setFormCard(card)} className="btn-ghost">
                Edit
              </button>
              <button onClick={() => setPendingDelete(card)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {formCard !== null && (
        <CardFormModal
          key={formCard === "new" ? "new" : formCard.id}
          card={formCard === "new" ? undefined : formCard}
          onClose={() => setFormCard(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      <ConfirmationModal
        open={pendingDelete !== null}
        title="Delete item?"
        message="Are you sure you want to delete this? This action can't be undone and the item will disappear from history."
        confirmLabel="Yes, delete"
        variant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmationModal
        open={pendingReactivate !== null}
        title="Back into the game?"
        message="Put this question back into the draw pool? It will leave the history."
        confirmLabel="Reactivate"
        variant="success"
        onCancel={() => setPendingReactivate(null)}
        onConfirm={handleConfirmReactivate}
      />
    </div>
  );
}
