"use client";

import { useRef, useState } from "react";

import { useClickOutside } from "@/lib/useClickOutside";
import { useCountdownTick } from "@/lib/useCountdownTick";

import EmojiText from "../EmojiText";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Floating, collapsed-by-default countdown indicator (bottom-right, chat-widget style)
 * so it doesn't compete with the header for space. Collapsed shows just the day count;
 * a click expands it in place to the full ticking breakdown; a second click on the
 * expanded pill opens the full read-only view (see CountdownView) — editing still lives
 * in the avatar menu.
 */
export default function CountdownBubble({
  msRemaining,
  anchoredAt,
  label,
  onExpandedClick,
}: {
  msRemaining: number;
  anchoredAt: number;
  label: string;
  onExpandedClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const breakdown = useCountdownTick(msRemaining, anchoredAt);

  useClickOutside(rootRef, expanded, () => setExpanded(false));

  const timeText = breakdown.isPast
    ? "today!"
    : `${breakdown.days}d ${pad(breakdown.hours)}h ${pad(breakdown.minutes)}m ${pad(breakdown.seconds)}s`;

  return (
    <div ref={rootRef} className="countdown-bubble-anchor">
      {expanded ? (
        <button
          type="button"
          className="countdown-bubble countdown-bubble-expanded"
          onClick={onExpandedClick}
        >
          <span className="text-text tabular-nums">{timeText}</span>
          <EmojiText text={label} className="text-muted text-xs" />
        </button>
      ) : (
        <button
          type="button"
          className="countdown-bubble countdown-bubble-collapsed"
          onClick={() => setExpanded(true)}
          aria-label={`Countdown: ${timeText} — ${label}`}
        >
          {breakdown.isPast ? "🎉" : `${breakdown.days}d`}
        </button>
      )}
    </div>
  );
}
