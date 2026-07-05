import type { Card, LevelMeta } from "@/data/cards";

export default function CardItem({
  card,
  meta,
  index,
  isOpen,
  onToggle,
}: {
  card: Card;
  meta: LevelMeta;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`card ${meta.className} ${isOpen ? "open" : ""}`}
      onClick={onToggle}
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
}
