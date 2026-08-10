"use client";

import { useState } from "react";
import Link from "next/link";
import { LEVEL_META, type Card } from "@/data/cards";
import { pickNextDare, pickRandomItem } from "@/lib/draw";
import { getJson, patchJson, postJson } from "@/lib/http";
import { parseCardRef } from "@/lib/id";
import { MANAGE_PATH } from "@/lib/routes";
import RoundCard from "./RoundCard";

type Screen = "idle" | "truth" | "dare" | "finished";

function isAiCardId(id: string): boolean {
  return parseCardRef(id)?.source === "ai";
}

export default function GameRound({ cards: initialCards }: { cards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [screen, setScreen] = useState<Screen>(() =>
    initialCards.some((c) => c.level !== "dare" && !c.answered) ? "idle" : "finished",
  );
  const [truthId, setTruthId] = useState<string | null>(null);
  const [dareId, setDareId] = useState<string | null>(null);
  const [dareError, setDareError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const hasDares = cards.some((c) => c.level === "dare");

  function drawTruth(excludeId?: string) {
    const pool = cards.filter(
      (c) => c.level !== "dare" && !c.answered && c.id !== excludeId,
    );
    const picked = pickRandomItem(pool);
    if (!picked) {
      setScreen("finished");
      return;
    }
    setTruthId(picked.id);
    setScreen("truth");
  }

  /** No-op if the deck has zero dare cards — callers must check `hasDares` before
   * offering a "draw a dare" action at all (see the truth-screen button below). */
  function drawDare(excludeId?: string) {
    const dares = cards.filter((c) => c.level === "dare");
    const picked = pickNextDare(dares, excludeId);
    if (!picked) return;
    setDareError(null);
    setDareId(picked.id);
    setScreen("dare");
  }

  async function handleGenerateAi() {
    setAiLoading(true);
    setAiError(null);
    const { ok, data } = await postJson<{ card: { id: number; level: Card["level"]; question: string } }>(
      "/api/ai-cards/generate",
      {},
    );
    setAiLoading(false);

    if (!ok || !data) {
      setAiError("Couldn't generate a question — check your connection and try again.");
      return;
    }

    const newCard: Card = {
      id: `ai-${data.card.id}`,
      level: data.card.level,
      question: data.card.question,
      answered: false,
    };
    setCards((prev) => [...prev, newCard]);
    setTruthId(newCard.id);
    setScreen("truth");
  }

  /** Called instead of drawTruth when leaving an AI-generated truth (skip or confirm):
   * cheaply asks the server whether the real deck has picked up a new question (e.g. a
   * partner added one mid-session) before falling back to generating another AI one. */
  async function drawAfterAi() {
    setAiLoading(true);
    const { ok, data } = await getJson<{ card: Card | null }>("/api/cards/next-truth");
    if (ok && data?.card) {
      const card = data.card;
      setAiLoading(false);
      setCards((prev) => [...prev, card]);
      setTruthId(card.id);
      setScreen("truth");
      return;
    }
    await handleGenerateAi();
  }

  async function markTruthAnswered(id: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, answered: true } : c)));
    await patchJson(`/api/cards/${id}/answered`, { answered: true });
  }

  /** Shared "what's next" step for both leaving-a-truth actions: an AI-generated truth
   * goes through the AI fallback flow, a manual one draws normally from the pool. */
  async function advanceFromTruth(id: string) {
    if (isAiCardId(id)) {
      await drawAfterAi();
    } else {
      drawTruth(id);
    }
  }

  async function handleConfirmRound() {
    if (!truthId || aiLoading) return;
    markTruthAnswered(truthId);
    await advanceFromTruth(truthId);
  }

  async function handleSkipTruth() {
    if (!truthId || aiLoading) return;
    await advanceFromTruth(truthId);
  }

  async function handleDareDone() {
    if (!dareId) return;
    setDareError(null);
    const { ok } = await patchJson(`/api/cards/${dareId}/complete`, {});
    if (!ok) {
      setDareError("Couldn't save that — check your connection and try again.");
      return;
    }
    setScreen("truth");
  }

  function handleSkipDare() {
    if (!dareId) return;
    drawDare(dareId);
  }

  const currentTruth = truthId ? (cards.find((c) => c.id === truthId) ?? null) : null;
  const currentDare = dareId ? (cards.find((c) => c.id === dareId) ?? null) : null;

  let content: React.ReactNode;

  if (screen === "dare" && currentDare) {
    content = (
      <RoundCard
        meta={LEVEL_META.dare}
        question={currentDare.question}
        badge={isAiCardId(currentDare.id) ? "🤖 AI generated" : undefined}
      >
        <button type="button" className="btn" onClick={handleDareDone}>
          Done 🔥
        </button>
        <button type="button" className="btn-ghost" onClick={handleSkipDare}>
          Skip 🔄
        </button>
        {dareError && <p className="form-error w-full basis-full text-center">{dareError}</p>}
      </RoundCard>
    );
  } else if (screen === "truth" && currentTruth) {
    content = (
      <RoundCard
        meta={LEVEL_META[currentTruth.level]}
        question={currentTruth.question}
        skipLabel="Skip this one"
        onSkip={handleSkipTruth}
        badge={isAiCardId(currentTruth.id) ? "🤖 AI generated" : undefined}
      >
        {hasDares && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => drawDare()}
            disabled={aiLoading}
          >
            😈 Draw a dare instead
          </button>
        )}
        <button type="button" className="btn" onClick={handleConfirmRound} disabled={aiLoading}>
          {aiLoading ? "Finding your next question..." : "Confirm & next"}
        </button>
      </RoundCard>
    );
  } else if (screen === "finished") {
    content = (
      <>
        <p className="font-serif text-xl text-text">
          You&apos;ve answered every question in the deck!
        </p>
        <Link href={MANAGE_PATH} className="btn">
          Add new questions
        </Link>
        <button type="button" className="btn-ghost" onClick={handleGenerateAi} disabled={aiLoading}>
          {aiLoading ? "Generating..." : "🤖 Ask AI for one"}
        </button>
        {aiError && <p className="form-error w-full basis-full text-center">{aiError}</p>}
      </>
    );
  } else {
    content = (
      <button type="button" className="btn" onClick={() => drawTruth()}>
        Draw a Truth
      </button>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      {content}
    </div>
  );
}
