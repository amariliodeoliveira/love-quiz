"use client";

import { useMemo, useState } from "react";

import ConfirmationModal from "@/app/_components/ConfirmationModal";
import { type Level, LEVEL_META } from "@/data/cards";
import { formatAnsweredAtManila } from "@/lib/datetime";
import type { DbAiCard, DbCard, Session } from "@/lib/db";
import { patchJson, postJson } from "@/lib/http";

import AIGenerateModal from "./AIGenerateModal";
import CardFormModal from "./CardFormModal";

type TopTab = "truths" | "dares" | "ai";
type SubTab = "active" | "history";

const RANK_BADGES = ["🥇", "🥈", "🥉"];

function byAnsweredAtDesc<T extends { answeredAt: Date | null }>(
  a: T,
  b: T,
): number {
  return b.answeredAt!.getTime() - a.answeredAt!.getTime();
}

/** Active/History toggle shared by the Truths and AI tabs. */
function SubTabToggle({
  value,
  onChange,
  label,
}: {
  value: SubTab;
  onChange: (value: SubTab) => void;
  label: string;
}) {
  return (
    <div className="tabs mb-6" role="group" aria-label={label}>
      <button
        type="button"
        className={`tab ${value === "active" ? "active-all" : ""}`}
        aria-pressed={value === "active"}
        onClick={() => onChange("active")}
      >
        Active
      </button>
      <button
        type="button"
        className={`tab ${value === "history" ? "active-all" : ""}`}
        aria-pressed={value === "history"}
        onClick={() => onChange("history")}
      >
        History
      </button>
    </div>
  );
}

export default function ManageDashboard({
  initialCards,
  initialAiCards,
  session,
}: {
  initialCards: DbCard[];
  initialAiCards: DbAiCard[];
  session: Session;
}) {
  const [cards, setCards] = useState<DbCard[]>(initialCards);
  const [aiCards, setAiCards] = useState<DbAiCard[]>(initialAiCards);
  const [topTab, setTopTab] = useState<TopTab>("truths");
  const [truthSubTab, setTruthSubTab] = useState<SubTab>("active");
  const [aiSubTab, setAiSubTab] = useState<SubTab>("active");
  const [showAiGenerateModal, setShowAiGenerateModal] = useState(false);
  const [formCard, setFormCard] = useState<DbCard | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DbCard | null>(null);
  const [pendingReactivate, setPendingReactivate] = useState<DbCard | null>(
    null,
  );

  async function handleFormSubmit(level: Level, question: string) {
    if (formCard === "new") {
      const { ok, data } = await postJson<{ card: DbCard }>(
        "/api/profile/cards",
        {
          level,
          question,
        },
      );
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
          prev.map((c) =>
            c.id === formCard.id ? { ...c, level, question } : c,
          ),
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
        prev.map((c) =>
          c.id === pendingReactivate.id ? { ...c, answeredAt: null } : c,
        ),
      );
    }
    setPendingReactivate(null);
  }

  async function handleGenerateAi(level: Level) {
    const { ok, data } = await postJson<{ card: DbAiCard }>(
      "/api/ai-cards/generate",
      { level },
    );
    if (ok && data) {
      setAiCards((prev) => [data.card, ...prev]);
    }
    return ok;
  }

  const activeAiCards = useMemo(
    () => aiCards.filter((c) => c.answeredAt === null),
    [aiCards],
  );
  const historyAiCards = useMemo(
    () =>
      aiCards.filter((c) => c.answeredAt !== null).toSorted(byAnsweredAtDesc),
    [aiCards],
  );

  const truths = useMemo(
    () => cards.filter((c) => c.level !== "dare"),
    [cards],
  );
  const activeTruths = truths.filter((c) => c.answeredAt === null);
  const historyTruths = useMemo(
    () =>
      truths.filter((c) => c.answeredAt !== null).toSorted(byAnsweredAtDesc),
    [truths],
  );
  const rankedDares = useMemo(
    () =>
      cards
        .filter((c) => c.level === "dare")
        .toSorted((a, b) => b.timesCompleted - a.timesCompleted),
    [cards],
  );

  let tabContent: React.ReactNode;
  if (topTab === "truths") {
    tabContent = (
      <>
        <SubTabToggle
          value={truthSubTab}
          onChange={setTruthSubTab}
          label="Truths filter"
        />

        {(truthSubTab === "active" ? activeTruths : historyTruths).map(
          (card) => {
            const meta = LEVEL_META[card.level];
            return (
              <div key={card.id} className="dashboard-card-row">
                <div>
                  <p className="dashboard-card-question">
                    {meta.emoji} {card.question}
                  </p>
                  {card.answeredAt && (
                    <p className="text-muted text-xs">
                      Answered on {formatAnsweredAtManila(card.answeredAt)}
                    </p>
                  )}
                </div>
                <div className="dashboard-card-actions">
                  {truthSubTab === "history" && (
                    <button
                      onClick={() => setPendingReactivate(card)}
                      className="btn-ghost"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => setFormCard(card)}
                    className="btn-ghost"
                  >
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
            );
          },
        )}
      </>
    );
  } else if (topTab === "dares") {
    tabContent = rankedDares.map((card, index) => (
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
    ));
  } else {
    tabContent = (
      <>
        <SubTabToggle
          value={aiSubTab}
          onChange={setAiSubTab}
          label="AI questions filter"
        />

        {(aiSubTab === "active" ? activeAiCards : historyAiCards).map(
          (card) => {
            const meta = LEVEL_META[card.level];
            return (
              <div key={card.id} className="dashboard-card-row">
                <div>
                  <p className="dashboard-card-question">
                    {meta.emoji} {card.question}
                  </p>
                  <p className="text-muted text-xs">
                    {card.answeredAt
                      ? `Answered on ${formatAnsweredAtManila(card.answeredAt)}`
                      : `Generated by ${card.model}`}
                  </p>
                </div>
              </div>
            );
          },
        )}
      </>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="page-title">Deck Studio</h1>
        <p className="dashboard-subtitle text-subtext">
          {session.role === "admin"
            ? "Seeing all cards"
            : "Seeing only your cards"}
        </p>
        <button onClick={() => setFormCard("new")} className="btn">
          + Add card
        </button>
        <button
          onClick={() => setShowAiGenerateModal(true)}
          className="btn-ghost"
        >
          🤖 Generate with AI
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
        <button
          type="button"
          className={`tab ${topTab === "ai" ? "active-all" : ""}`}
          aria-pressed={topTab === "ai"}
          onClick={() => setTopTab("ai")}
        >
          AI
        </button>
      </div>

      {tabContent}

      {formCard !== null && (
        <CardFormModal
          key={formCard === "new" ? "new" : formCard.id}
          card={formCard === "new" ? undefined : formCard}
          onClose={() => setFormCard(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {showAiGenerateModal && (
        <AIGenerateModal
          onClose={() => setShowAiGenerateModal(false)}
          onGenerate={handleGenerateAi}
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
