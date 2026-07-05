"use client";

import { useMemo, useState } from "react";
import { ALL_LEVELS, LEVEL_META, type Card } from "@/data/cards";
import DeckHeader, { type FilterValue } from "./DeckHeader";
import DeckFooter from "./DeckFooter";
import LevelSection from "./LevelSection";

export default function CardDeck({ cards }: { cards: Card[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const levelsToShow = filter === "all" ? ALL_LEVELS : [filter];

  const dareCount = useMemo(
    () => cards.filter((c) => c.level === "dare").length,
    [cards],
  );
  const questionCount = cards.length - dareCount;

  return (
    <>
      <DeckHeader filter={filter} onFilterChange={setFilter} />

      <main>
        {levelsToShow.map((level) => (
          <LevelSection
            key={level}
            level={level}
            meta={LEVEL_META[level]}
            cards={cards.filter((c) => c.level === level)}
            openIds={openIds}
            onToggleCard={toggleCard}
          />
        ))}
      </main>

      <DeckFooter questionCount={questionCount} dareCount={dareCount} />
    </>
  );
}
