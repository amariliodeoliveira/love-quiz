"use client";

import { useCountdownTick } from "@/lib/useCountdownTick";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Floating countdown indicator (bottom-right, chat-widget style) so it doesn't compete
 * with the header for space. Just an hourglass — click opens the full read-only view
 * (see CountdownView); editing still lives in the avatar menu.
 */
export default function CountdownBubble({
  msRemaining,
  anchoredAt,
  label,
  onClick,
}: {
  msRemaining: number;
  anchoredAt: number;
  label: string;
  onClick: () => void;
}) {
  const breakdown = useCountdownTick(msRemaining, anchoredAt);

  const timeText = breakdown.isPast
    ? "today!"
    : `${breakdown.days}d ${pad(breakdown.hours)}h ${pad(breakdown.minutes)}m ${pad(breakdown.seconds)}s`;

  return (
    <button
      type="button"
      className="countdown-bubble"
      onClick={onClick}
      aria-label={`Countdown: ${timeText} — ${label}`}
    >
      {breakdown.isPast ? "🎉" : "⏳"}
    </button>
  );
}
