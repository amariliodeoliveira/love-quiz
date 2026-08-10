"use client";

import { useState } from "react";
import Link from "next/link";
import { LEVEL_META, type Card } from "@/data/cards";
import { pickNextDare, pickRandomItem } from "@/lib/draw";
import { patchJson } from "@/lib/http";
import { MANAGE_PATH } from "@/lib/routes";
import RoundCard from "./RoundCard";

type Screen = "idle" | "truth" | "dare" | "finished";

export default function GameRound({ cards: initialCards }: { cards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [screen, setScreen] = useState<Screen>(() =>
    initialCards.some((c) => c.level !== "dare" && !c.answered) ? "idle" : "finished",
  );
  const [truthId, setTruthId] = useState<string | null>(null);
  const [dareId, setDareId] = useState<string | null>(null);
  const [dareError, setDareError] = useState<string | null>(null);

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

  async function markTruthAnswered(id: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, answered: true } : c)));
    await patchJson(`/api/cards/${id}/answered`, { answered: true });
  }

  function handleConfirmRound() {
    if (!truthId) return;
    markTruthAnswered(truthId);
    drawTruth(truthId);
  }

  function handleSkipTruth() {
    if (!truthId) return;
    drawTruth(truthId);
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
      <RoundCard meta={LEVEL_META.dare} question={currentDare.question}>
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
      >
        {hasDares && (
          <button type="button" className="btn-ghost" onClick={() => drawDare()}>
            😈 Draw a dare instead
          </button>
        )}
        <button type="button" className="btn" onClick={handleConfirmRound}>
          Confirm &amp; next
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
