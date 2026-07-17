import type { Card, Level, LevelMeta } from "@/data/cards";
import CardItem from "./CardItem";

export default function LevelSection({
  level,
  meta,
  cards,
  openIds,
  onToggleCard,
  onAnsweredChange,
}: {
  level: Level;
  meta: LevelMeta;
  cards: Card[];
  openIds: Set<string>;
  onToggleCard: (id: string) => void;
  onAnsweredChange: (id: string, answered: boolean) => void;
}) {
  const noun = level === "dare" ? "dares" : "cards";
  const answeredCount = cards.filter((c) => c.answered).length;

  return (
    <section className={`level-section ${meta.className} visible`}>
      <div className="level-header">
        <div className="level-dot" aria-hidden="true" />
        <h2 className="level-label">{meta.label}</h2>
        <span className="level-count">
          {answeredCount}/{cards.length} {noun} answered
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
          onAnsweredChange={(answered) => onAnsweredChange(card.id, answered)}
        />
      ))}
    </section>
  );
}
