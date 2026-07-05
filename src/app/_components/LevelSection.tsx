import type { Card, Level, LevelMeta } from "@/data/cards";
import CardItem from "./CardItem";

export default function LevelSection({
  level,
  meta,
  cards,
  openIds,
  onToggleCard,
}: {
  level: Level;
  meta: LevelMeta;
  cards: Card[];
  openIds: Set<string>;
  onToggleCard: (id: string) => void;
}) {
  const noun = level === "dare" ? "dares" : "cards";

  return (
    <div className={`level-section ${meta.className} visible`}>
      <div className="level-header">
        <div className="level-dot" />
        <span className="level-label">{meta.label}</span>
        <span className="level-count">
          {cards.length} {noun}
        </span>
      </div>
      <div className="level-divider" />

      {cards.map((card, index) => (
        <CardItem
          key={card.id}
          card={card}
          meta={meta}
          index={index}
          isOpen={openIds.has(card.id)}
          onToggle={() => onToggleCard(card.id)}
        />
      ))}
    </div>
  );
}
