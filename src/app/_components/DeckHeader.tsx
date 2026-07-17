import type { Level } from "@/data/cards";

export type FilterValue = "all" | Level;

const FILTERS: { value: FilterValue; label: string; activeClass: string }[] = [
  { value: "all", label: "All cards", activeClass: "active-all" },
  { value: "1", label: "🟢 Light", activeClass: "active-1" },
  { value: "2", label: "🟡 Medium", activeClass: "active-2" },
  { value: "3", label: "🔴 Heavy", activeClass: "active-3" },
  { value: "dare", label: "😈 Dares", activeClass: "active-dare" },
];

export default function DeckHeader({
  filter,
  onFilterChange,
  onDrawQuestion,
}: {
  filter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  onDrawQuestion: () => void;
}) {
  return (
    <div className="border-b border-border px-6 pt-18 pb-14 text-center">
      <p className="mb-5 text-xs font-medium tracking-[0.18em] text-muted uppercase">
        Interactive Game
      </p>
      <h1 className="mb-4 font-serif text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.1] font-normal text-text">
        Couples
        <br />
        <em className="text-subtext italic">Card Deck</em>
      </h1>
      <p className="mx-auto mb-6 max-w-[400px] text-[0.95rem] leading-[1.6] text-subtext">
        On a call together? Draw a card and read it out loud — or browse the
        deck yourselves below.
      </p>
      <div className="mb-9 flex justify-center">
        <button type="button" className="btn" onClick={onDrawQuestion}>
          🎲 Draw a question
        </button>
      </div>
      <div className="tabs" role="group" aria-label="Filter cards by level">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`tab ${filter === f.value ? f.activeClass : ""}`}
            aria-pressed={filter === f.value}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
