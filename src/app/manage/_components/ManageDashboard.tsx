"use client";

import { useMemo, useState } from "react";

import ConfirmationModal from "@/app/_components/ConfirmationModal";
import { type Level, LEVEL_META } from "@/data/cards";
import { formatAnsweredAtManila } from "@/lib/datetime";
import type { DbAiCard, DbCard, Session } from "@/lib/db";
import { patchJson, postJson } from "@/lib/http";

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

/** Active/History toggle shared by the Truths and AI tabs. Deliberately styled as an
 * underlined sub-filter (not a pill like the top-level tabs) with a visible caption —
 * it's a filter *within* the tab above, not a second row of the same kind of choice. */
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
    <div className="mb-6">
      <p className="tabs-sub-label">Showing</p>
      <div className="tabs-sub" role="group" aria-label={label}>
        <button
          type="button"
          className={`tab-sub ${value === "active" ? "active-all" : ""}`}
          aria-pressed={value === "active"}
          onClick={() => onChange("active")}
        >
          Active
        </button>
        <button
          type="button"
          className={`tab-sub ${value === "history" ? "active-all" : ""}`}
          aria-pressed={value === "history"}
          onClick={() => onChange("history")}
        >
          History
        </button>
      </div>
    </div>
  );
}

function TruthsTab({
  subTab,
  onSubTabChange,
  cards,
  onEdit,
  onDelete,
  onReactivate,
}: {
  subTab: SubTab;
  onSubTabChange: (value: SubTab) => void;
  cards: DbCard[];
  onEdit: (card: DbCard) => void;
  onDelete: (card: DbCard) => void;
  onReactivate: (card: DbCard) => void;
}) {
  return (
    <>
      <SubTabToggle
        value={subTab}
        onChange={onSubTabChange}
        label="Truths filter"
      />

      {cards.length === 0 && (
        <p className="dashboard-empty">
          {subTab === "active"
            ? "No unanswered truths left — add one above, or generate one with AI."
            : "No answered truths yet."}
        </p>
      )}
      {cards.map((card) => {
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
              {subTab === "history" && (
                <button
                  onClick={() => onReactivate(card)}
                  className="btn-ghost"
                >
                  Reactivate
                </button>
              )}
              <button onClick={() => onEdit(card)} className="btn-ghost">
                Edit
              </button>
              <button onClick={() => onDelete(card)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

function DaresTab({
  cards,
  onEdit,
  onDelete,
}: {
  cards: DbCard[];
  onEdit: (card: DbCard) => void;
  onDelete: (card: DbCard) => void;
}) {
  if (cards.length === 0) {
    return (
      <p className="dashboard-empty">
        No dares yet — add one above, or generate one with AI.
      </p>
    );
  }

  return cards.map((card, index) => (
    <div key={card.id} className="dashboard-card-row">
      <p className="dashboard-card-question">
        {index < 3 ? `${RANK_BADGES[index]} ` : ""}
        {card.question} · {card.timesCompleted}x
      </p>
      <div className="dashboard-card-actions">
        <button onClick={() => onEdit(card)} className="btn-ghost">
          Edit
        </button>
        <button onClick={() => onDelete(card)} className="btn-danger">
          Delete
        </button>
      </div>
    </div>
  ));
}

function AiTab({
  subTab,
  onSubTabChange,
  cards,
}: {
  subTab: SubTab;
  onSubTabChange: (value: SubTab) => void;
  cards: DbAiCard[];
}) {
  return (
    <>
      <SubTabToggle
        value={subTab}
        onChange={onSubTabChange}
        label="AI questions filter"
      />

      {cards.length === 0 && (
        <p className="dashboard-empty">
          {subTab === "active"
            ? "No unanswered AI questions — generate one above."
            : "No answered AI questions yet."}
        </p>
      )}
      {cards.map((card) => {
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
      })}
    </>
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
  // AI-drafted cards are created through the same manual Add Card flow now (see
  // CardFormModal), so nothing here ever adds to this list after the initial load —
  // it only needs to be read, not set.
  const aiCards = initialAiCards;
  const [topTab, setTopTab] = useState<TopTab>("truths");
  const [truthSubTab, setTruthSubTab] = useState<SubTab>("active");
  const [aiSubTab, setAiSubTab] = useState<SubTab>("active");
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
      <TruthsTab
        subTab={truthSubTab}
        onSubTabChange={setTruthSubTab}
        cards={truthSubTab === "active" ? activeTruths : historyTruths}
        onEdit={setFormCard}
        onDelete={setPendingDelete}
        onReactivate={setPendingReactivate}
      />
    );
  } else if (topTab === "dares") {
    tabContent = (
      <DaresTab
        cards={rankedDares}
        onEdit={setFormCard}
        onDelete={setPendingDelete}
      />
    );
  } else {
    tabContent = (
      <AiTab
        subTab={aiSubTab}
        onSubTabChange={setAiSubTab}
        cards={aiSubTab === "active" ? activeAiCards : historyAiCards}
      />
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Deck Studio</h1>
          <p className="dashboard-subtitle text-subtext">
            {session.role === "admin"
              ? "Add or edit every question and dare in the deck."
              : "Add or edit your own questions and dares."}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <button onClick={() => setFormCard("new")} className="btn">
            + Add card
          </button>
        </div>
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
