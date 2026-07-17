import { useId } from "react";
import type { Card, LevelMeta } from "@/data/cards";

export default function CardItem({
  card,
  meta,
  index,
  isOpen,
  onToggle,
  onAnsweredChange,
}: {
  card: Card;
  meta: LevelMeta;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onAnsweredChange: (answered: boolean) => void;
}) {
  const bodyId = useId();

  return (
    <div
      className={`card ${meta.className} ${isOpen ? "open" : ""} ${card.answered ? "answered" : ""}`}
    >
      <div className="card-header">
        <input
          type="checkbox"
          className="card-check"
          checked={card.answered}
          onChange={(e) => onAnsweredChange(e.target.checked)}
          aria-label={`Mark question ${index + 1} in ${meta.label} as answered`}
        />
        <button
          type="button"
          id={`card-toggle-${card.id}`}
          className="card-toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
        >
          <span className="card-num">{index + 1}</span>
          <span className="card-emoji" aria-hidden="true">
            {meta.emoji}
          </span>
          <span className="card-hint">{isOpen ? "tap to close" : "tap to reveal"}</span>
          <span className="card-arrow" aria-hidden="true">
            ▶
          </span>
        </button>
      </div>
      {isOpen && (
        <div className="card-body" id={bodyId}>
          <p className="card-question">{card.question}</p>
        </div>
      )}
    </div>
  );
}
