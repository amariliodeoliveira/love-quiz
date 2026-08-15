import type { ReactNode } from "react";

import GameWordmark from "./GameWordmark";

/**
 * Shared "hero" block (eyebrow label + wordmark + description + CTA slot) used by both
 * the home page and the /truth-or-dare landing — kept as one component so the two stay
 * visually identical and spacing only needs fixing in one place.
 *
 * Spacing follows the standard proximity rule (more space *before* a heading than
 * after it, so it "attaches" to what it introduces) and the 8pt grid: eyebrow→wordmark
 * 24px, wordmark→description 16px (set on GameWordmark itself), description→CTA 32px —
 * each gap bigger than the last, since each is a jump to a progressively less related
 * element.
 */
export default function LandingHero({
  description,
  children,
}: {
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="px-6 pt-18 pb-14 text-center">
      <p className="text-muted mb-6 text-xs font-medium tracking-[0.18em] uppercase">
        Interactive Game
      </p>
      <GameWordmark />
      <p className="leading-1.6 text-subtext mx-auto mb-8 max-w-100 text-[0.95rem]">
        {description}
      </p>
      {children}
    </div>
  );
}
