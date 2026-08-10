"use client";

import { useCountdownTick } from "@/lib/useCountdownTick";
import EmojiText from "../EmojiText";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const STAT_ORDER = ["days", "hours", "minutes", "seconds"] as const;
const STAT_LABEL: Record<(typeof STAT_ORDER)[number], string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

/** Read-only, expanded countdown view — big ticking numbers plus full context (location,
 * exact date). No editing here on purpose: editing lives in the avatar menu. */
export default function CountdownView({
  msRemaining,
  anchoredAt,
  label,
  location,
  timeZone,
  targetAtIso,
}: {
  msRemaining: number;
  anchoredAt: number;
  label: string;
  location: string | null;
  timeZone: string;
  targetAtIso: string;
}) {
  const breakdown = useCountdownTick(msRemaining, anchoredAt);

  const exactDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date(targetAtIso));

  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center">
      <EmojiText text={label} className="font-serif text-2xl text-text" />

      {breakdown.isPast ? (
        <p className="font-serif text-3xl text-text">Today! 🎉</p>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:gap-6">
          {STAT_ORDER.map((unit) => (
            <div key={unit} className="flex flex-col items-center">
              <span className="font-serif text-4xl text-text tabular-nums sm:text-5xl">
                {pad(breakdown[unit])}
              </span>
              <span className="mt-1 text-xs tracking-[0.08em] text-muted uppercase">
                {STAT_LABEL[unit]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {location && <p className="text-subtext">{location}</p>}
        <p className="login-hint">{exactDate}</p>
      </div>
    </div>
  );
}
