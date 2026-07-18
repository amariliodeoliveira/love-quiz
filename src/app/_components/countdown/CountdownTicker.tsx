"use client";

import { useCountdownTick } from "@/lib/useCountdownTick";
import EmojiText from "../EmojiText";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Compact, live-ticking header display — label only, no location. Click opens the
 * read-only expanded view (see CountdownView); editing lives in the avatar menu. */
export default function CountdownTicker({
  msRemaining,
  label,
  onClick,
}: {
  msRemaining: number;
  label: string;
  onClick: () => void;
}) {
  const breakdown = useCountdownTick(msRemaining);

  return (
    <button
      type="button"
      className="flex cursor-pointer flex-col items-center gap-0.5 text-subtext hover:text-text"
      onClick={onClick}
    >
      <span className="text-base font-medium tracking-[0.02em] tabular-nums">
        {breakdown.isPast
          ? "today!"
          : `${breakdown.days}d ${pad(breakdown.hours)}h ${pad(breakdown.minutes)}m ${pad(breakdown.seconds)}s`}
      </span>
      <EmojiText text={label} className="text-xs text-muted" />
    </button>
  );
}
