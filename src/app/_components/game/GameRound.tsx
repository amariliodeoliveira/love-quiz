"use client";

import { useState } from "react";
import Link from "next/link";
import { LEVEL_META, type Card } from "@/data/cards";
import { pickRandomItem } from "@/lib/draw";
import { patchJson } from "@/lib/http";
import { MANAGE_PATH } from "@/lib/routes";
import RoundCard from "./RoundCard";

type Screen = "idle" | "truth" | "dare" | "finished";

export default function GameRound({ cards: initialCards }: { cards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [screen, setScreen] = useState<Screen>("idle");
  const [truthId, setTruthId] = useState<string | null>(null);
  const [dareId, setDareId] = useState<string | null>(null);

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

  /** Dares never leave the draw pool (no `answered` filter) — only excludes the one
   * currently shown, so "skip" doesn't just redraw the same dare. */
  function drawDare(excludeId?: string) {
    const dares = cards.filter((c) => c.level === "dare");
    const picked = pickRandomItem(dares.filter((c) => c.id !== excludeId)) ?? pickRandomItem(dares);
    if (!picked) return;
    setDareId(picked.id);
    setScreen("dare");
  }

  async function markTruthAnswered(id: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, answered: true } : c)));
    await patchJson(`/api/cards/${id}/answered`, { answered: true });
  }

  async function completeDare(id: string) {
    await patchJson(`/api/cards/${id}/complete`, {});
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
    await completeDare(dareId);
    setScreen("truth");
  }

  function handleSkipDare() {
    if (!dareId) return;
    drawDare(dareId);
  }

  const currentTruth = truthId ? (cards.find((c) => c.id === truthId) ?? null) : null;
  const currentDare = dareId ? (cards.find((c) => c.id === dareId) ?? null) : null;

  if (screen === "dare" && currentDare) {
    return (
      <RoundCard meta={LEVEL_META.dare} question={currentDare.question}>
        <button type="button" className="btn" onClick={handleDareDone}>
          Done 🔥
        </button>
        <button type="button" className="btn-ghost" onClick={handleSkipDare}>
          Skip 🔄
        </button>
      </RoundCard>
    );
  }

  if (screen === "truth" && currentTruth) {
    return (
      <RoundCard
        meta={LEVEL_META[currentTruth.level]}
        question={currentTruth.question}
        skipLabel="Skip this one"
        onSkip={handleSkipTruth}
      >
        <button type="button" className="btn-ghost" onClick={() => drawDare()}>
          😈 Draw a dare instead
        </button>
        <button type="button" className="btn" onClick={handleConfirmRound}>
          Confirm &amp; next
        </button>
      </RoundCard>
    );
  }

  if (screen === "finished") {
    return (
      <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
        <p className="font-serif text-xl text-text">
          You&apos;ve answered every question in the deck!
        </p>
        <Link href={MANAGE_PATH} className="btn">
          Add new questions
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
      <button type="button" className="btn" onClick={() => drawTruth()}>
        Draw a Truth
      </button>
    </div>
  );
}
