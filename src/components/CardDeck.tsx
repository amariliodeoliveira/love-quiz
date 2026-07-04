"use client";

import { useMemo, useState } from "react";
import { cards, LEVEL_META, type Level } from "@/data/cards";

type FilterValue = "all" | Level;

const FILTERS: { value: FilterValue; label: string; activeClass: string }[] = [
  { value: "all", label: "All cards", activeClass: "active-all" },
  { value: "1", label: "🟢 Light", activeClass: "active-1" },
  { value: "2", label: "🟡 Medium", activeClass: "active-2" },
  { value: "3", label: "🔴 Heavy", activeClass: "active-3" },
  { value: "dare", label: "🟣 Dares", activeClass: "active-dare" },
];

export default function CardDeck() {
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

  const levelsToShow: Level[] = useMemo(() => {
    if (filter === "all") return ["1", "2", "3", "dare"];
    return [filter];
  }, [filter]);

  return (
    <>
      <div className="hero">
        <p className="hero-eyebrow">Interactive Game</p>
        <h1>
          Couples
          <br />
          <em>Card Deck</em>
        </h1>
        <p>
          Tap a card to reveal the question. Move through the levels at your own
          pace.
        </p>
        <div className="tabs">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`tab ${filter === f.value ? f.activeClass : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <main>
        {levelsToShow.map((level) => {
          const meta = LEVEL_META[level];
          const levelCards = cards.filter((c) => c.level === level);
          const noun = level === "dare" ? "dares" : "cards";

          return (
            <div
              key={level}
              className={`level-section ${meta.className} visible`}
            >
              <div className="level-header">
                <div className="level-dot" />
                <span className="level-label">{meta.label}</span>
                <span className="level-count">
                  {levelCards.length} {noun}
                </span>
              </div>
              <div className="level-divider" />

              {levelCards.map((card, index) => {
                const isOpen = openIds.has(card.id);
                return (
                  <div
                    key={card.id}
                    className={`card ${meta.className} ${isOpen ? "open" : ""}`}
                    onClick={() => toggleCard(card.id)}
                  >
                    <div className="card-header">
                      <span className="card-num">{index + 1}</span>
                      <span className="card-emoji">{meta.emoji}</span>
                      <span className="card-hint">
                        {isOpen ? "tap to close" : "tap to reveal"}
                      </span>
                      <span className="card-arrow">▶</span>
                    </div>
                    {isOpen && (
                      <div className="card-body">
                        <p className="card-question">{card.question}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </main>

      <footer>99 cards · 3 levels · 11 dares · built for two</footer>
    </>
  );
}
