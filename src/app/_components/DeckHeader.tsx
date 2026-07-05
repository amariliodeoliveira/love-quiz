import type { Level } from "@/data/cards";

export type FilterValue = "all" | Level;

const FILTERS: { value: FilterValue; label: string; activeClass: string }[] = [
  { value: "all", label: "All cards", activeClass: "active-all" },
  { value: "1", label: "🟢 Light", activeClass: "active-1" },
  { value: "2", label: "🟡 Medium", activeClass: "active-2" },
  { value: "3", label: "🔴 Heavy", activeClass: "active-3" },
  { value: "dare", label: "🟣 Dares", activeClass: "active-dare" },
];

export default function DeckHeader({
  filter,
  onFilterChange,
}: {
  filter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}) {
  return (
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
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
