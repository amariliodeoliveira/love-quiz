"use client";

import Link from "next/link";
import { useState } from "react";

import { type Card, LEVEL_META } from "@/data/cards";
import { pickNextDare, pickRandomItem } from "@/lib/draw";
import { getJson, patchJson, postJson } from "@/lib/http";
import { parseCardRef } from "@/lib/id";
import { MANAGE_PATH } from "@/lib/routes";

import RoundCard from "./RoundCard";

type Screen = "idle" | "truth" | "dare" | "finished";

function isAiCardId(id: string): boolean {
  return parseCardRef(id)?.source === "ai";
}

function RoundContent({
  screen,
  currentDare,
  currentTruth,
  hasDares,
  aiLoading,
  dareError,
  aiError,
  onDareDone,
  onSkipDare,
  onDrawDareInstead,
  onSkipTruth,
  onConfirmRound,
  onDrawTruth,
  onGenerateAi,
}: {
  screen: Screen;
  currentDare: Card | null;
  currentTruth: Card | null;
  hasDares: boolean;
  aiLoading: boolean;
  dareError: string | null;
  aiError: string | null;
  onDareDone: () => void;
  onSkipDare: () => void;
  onDrawDareInstead: () => void;
  onSkipTruth: () => void;
  onConfirmRound: () => void;
  onDrawTruth: () => void;
  onGenerateAi: () => void;
}): React.ReactNode {
  if (screen === "dare" && currentDare) {
    return (
      <RoundCard
        meta={LEVEL_META.dare}
        question={currentDare.question}
        badge={isAiCardId(currentDare.id) ? "🤖 AI generated" : undefined}
      >
        <button type="button" className="btn" onClick={onDareDone}>
          Done 🔥
        </button>
        <button type="button" className="btn-ghost" onClick={onSkipDare}>
          Skip 🔄
        </button>
        {dareError && (
          <p className="form-error w-full basis-full text-center">
            {dareError}
          </p>
        )}
      </RoundCard>
    );
  }

  if (screen === "truth" && currentTruth) {
    return (
      <RoundCard
        meta={LEVEL_META[currentTruth.level]}
        question={currentTruth.question}
        skipLabel="Skip this one"
        onSkip={onSkipTruth}
        badge={isAiCardId(currentTruth.id) ? "🤖 AI generated" : undefined}
      >
        {hasDares && (
          <button
            type="button"
            className="btn-ghost"
            onClick={onDrawDareInstead}
            disabled={aiLoading}
          >
            😈 Draw a dare instead
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={onConfirmRound}
          disabled={aiLoading}
        >
          {aiLoading ? "Finding your next question..." : "Confirm & next"}
        </button>
      </RoundCard>
    );
  }

  if (screen === "finished") {
    return (
      <>
        <p className="text-text font-serif text-xl">
          You&apos;ve answered every question in the deck!
        </p>
        <Link href={MANAGE_PATH} className="btn">
          Add new questions
        </Link>
        <button
          type="button"
          className="btn-ghost"
          onClick={onGenerateAi}
          disabled={aiLoading}
        >
          {aiLoading ? "Generating..." : "🤖 Ask AI for one"}
        </button>
        {aiError && (
          <p className="form-error w-full basis-full text-center">{aiError}</p>
        )}
      </>
    );
  }

  return (
    <button type="button" className="btn" onClick={onDrawTruth}>
      Draw a Truth
    </button>
  );
}

export default function GameRound({ cards: initialCards }: { cards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [screen, setScreen] = useState<Screen>(() =>
    initialCards.some((c) => c.level !== "dare" && !c.answered)
      ? "idle"
      : "finished",
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
    const { ok, data } = await postJson<{
      card: { id: number; level: Card["level"]; question: string };
    }>("/api/ai-cards/generate", {});
    setAiLoading(false);

    if (!ok || !data) {
      setAiError(
        "Couldn't generate a question — check your connection and try again.",
      );
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
    const { ok, data } = await getJson<{ card: Card | null }>(
      "/api/cards/next-truth",
    );
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
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, answered: true } : c)),
    );
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
    await markTruthAnswered(truthId);
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

  const currentTruth = truthId
    ? (cards.find((c) => c.id === truthId) ?? null)
    : null;
  const currentDare = dareId
    ? (cards.find((c) => c.id === dareId) ?? null)
    : null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <RoundContent
        screen={screen}
        currentDare={currentDare}
        currentTruth={currentTruth}
        hasDares={hasDares}
        aiLoading={aiLoading}
        dareError={dareError}
        aiError={aiError}
        onDareDone={handleDareDone}
        onSkipDare={handleSkipDare}
        onDrawDareInstead={() => drawDare()}
        onSkipTruth={handleSkipTruth}
        onConfirmRound={handleConfirmRound}
        onDrawTruth={() => drawTruth()}
        onGenerateAi={handleGenerateAi}
      />
    </div>
  );
}
