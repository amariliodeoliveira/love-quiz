"use client";

import { useMemo, useState } from "react";
import { ALL_LEVELS, LEVEL_META, type Card } from "@/data/cards";
import { pickRandomItem } from "@/lib/draw";
import { patchJson, postJson } from "@/lib/http";
import DeckHeader, { type FilterValue } from "./DeckHeader";
import DeckFooter from "./DeckFooter";
import LevelSection from "./LevelSection";
import CardReaderModal from "./CardReaderModal";

type DrawPool = "question" | "dare";

export default function CardDeck({ cards: initialCards }: { cards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const [drawPool, setDrawPool] = useState<DrawPool | null>(null);
  const [drawnId, setDrawnId] = useState<string | null>(null);
  const [readerExpanded, setReaderExpanded] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function setAnswered(id: string, answered: boolean) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, answered } : c)));
    await patchJson(`/api/cards/${id}/answered`, { answered });
  }

  function poolFor(pool: DrawPool, excludeId?: string) {
    return cards.filter(
      (c) =>
        (pool === "dare" ? c.level === "dare" : c.level !== "dare") &&
        !c.answered &&
        c.id !== excludeId,
    );
  }

  /** `closeId`, if given, is collapsed back closed in the list — used by skip, which
   * should leave the card exactly as it was (not answered, not left open). */
  function draw(pool: DrawPool, excludeId?: string, closeId?: string) {
    const picked = pickRandomItem(poolFor(pool, excludeId));
    setDrawPool(pool);
    setReaderExpanded(true);
    if (!picked) {
      setDrawnId(null);
      setEmptyMessage(
        pool === "dare"
          ? "You've done every dare in the deck!"
          : "You've answered every question in the deck!",
      );
    } else {
      setEmptyMessage(null);
      setDrawnId(picked.id);
    }
    if (closeId || picked) {
      setOpenIds((prev) => {
        const next = new Set(prev);
        if (closeId) next.delete(closeId);
        if (picked) next.add(picked.id);
        return next;
      });
    }
  }

  function handleMarkAnsweredAndNext() {
    if (!drawnId || !drawPool) return;
    setAnswered(drawnId, true);
    draw(drawPool, drawnId);
  }

  function handleSkip() {
    if (!drawPool) return;
    draw(drawPool, drawnId ?? undefined, drawnId ?? undefined);
  }

  async function handleResetProgress() {
    setCards((prev) => prev.map((c) => ({ ...c, answered: false })));
    await postJson("/api/cards/reset-answered", {});
    if (drawPool) draw(drawPool);
  }

  function closeReader() {
    setDrawnId(null);
    setDrawPool(null);
    setReaderExpanded(false);
    setEmptyMessage(null);
  }

  function handleMinimize() {
    setReaderExpanded(false);
    if (!drawnId) return;
    const id = drawnId;
    // Deferred: Modal's own close restores focus to whatever was focused before it
    // opened (correct a11y behavior on its own) — this has to run after that, or its
    // restore wins the race and yanks focus right back off the card.
    setTimeout(() => {
      const el = document.getElementById(`card-toggle-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      // preventScroll: focus() jumping the viewport on its own would cancel the
      // smooth scroll above mid-flight — this leaves scrolling entirely to it.
      el?.focus({ preventScroll: true });
    }, 0);
  }

  const levelsToShow = filter === "all" ? ALL_LEVELS : [filter];

  const dareCount = useMemo(
    () => cards.filter((c) => c.level === "dare").length,
    [cards],
  );
  const questionCount = cards.length - dareCount;

  const drawnCard = drawnId ? (cards.find((c) => c.id === drawnId) ?? null) : null;
  const drawnMeta = drawnCard ? LEVEL_META[drawnCard.level] : null;

  return (
    <>
      <DeckHeader
        filter={filter}
        onFilterChange={setFilter}
        onDrawQuestion={() => draw("question")}
      />

      <main>
        {levelsToShow.map((level) => (
          <LevelSection
            key={level}
            level={level}
            meta={LEVEL_META[level]}
            cards={cards.filter((c) => c.level === level)}
            openIds={openIds}
            onToggleCard={toggleCard}
            onAnsweredChange={setAnswered}
          />
        ))}
      </main>

      <DeckFooter questionCount={questionCount} dareCount={dareCount} />

      <CardReaderModal
        open={readerExpanded}
        card={drawnCard}
        meta={drawnMeta}
        emptyMessage={emptyMessage}
        onMarkAnsweredAndNext={handleMarkAnsweredAndNext}
        onDrawDareInstead={() => draw("dare")}
        onSkip={handleSkip}
        onMinimize={handleMinimize}
        onClose={closeReader}
        onResetProgress={handleResetProgress}
      />

      {(drawnId || emptyMessage) && !readerExpanded && (
        <button
          type="button"
          className="btn fixed bottom-6 left-1/2 z-40 -translate-x-1/2 shadow-lg"
          onClick={() => setReaderExpanded(true)}
        >
          📖 Resume reading
        </button>
      )}
    </>
  );
}
