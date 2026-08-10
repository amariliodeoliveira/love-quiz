import type { Countdown } from "@/lib/db";

export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

/** Splits a signed duration (ms) into day/hour/minute/second parts. `ms <= 0` means the target has arrived. */
export function breakdownDuration(ms: number): CountdownBreakdown {
  const isPast = ms <= 0;
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  return { days, hours, minutes, seconds, isPast };
}

/** Milliseconds from `now` (defaults to the server's own clock) until `targetAt`. */
export function msUntil(targetAt: Date, now: Date = new Date()): number {
  return targetAt.getTime() - now.getTime();
}

/**
 * Re-derives "ms remaining" at time `now` from a baseline `msRemaining` recorded at
 * `anchoredAt`. Every ticking display of the same countdown must share the same
 * `anchoredAt` — that's what keeps two independently-mounted displays (e.g. a header
 * ticker and a modal opened later) in sync instead of drifting apart.
 */
export function remainingMsAt(msRemaining: number, anchoredAt: number, now: number): number {
  return msRemaining - (now - anchoredAt);
}

export interface CountdownDisplay {
  msRemaining: number;
  label: string;
  location: string | null;
  timeZone: string;
  targetAtIso: string;
}

/** Shapes a DB countdown row into what the client Countdown component needs — computing
 * `msRemaining` from the server's own clock, and serializing the target as an ISO string
 * for the server/client boundary. */
export function toCountdownDisplay(countdown: Countdown | null): CountdownDisplay | null {
  if (!countdown) return null;
  return {
    msRemaining: msUntil(countdown.targetAt),
    label: countdown.label,
    location: countdown.location,
    timeZone: countdown.timeZone,
    targetAtIso: countdown.targetAt.toISOString(),
  };
}

export interface WallClockParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

/**
 * Converts wall-clock date/time parts, as read on a clock in `timeZone`, to the UTC
 * instant they represent (correctly accounting for that zone's DST rules on that date).
 *
 * Works by taking a naive guess (treating the parts as if they were UTC), checking what
 * that guess actually reads as when displayed in `timeZone`, and correcting by the
 * difference — the standard technique for zoned-time conversion without a date library.
 */
export function zonedTimeToUtc(parts: WallClockParts, timeZone: string): Date {
  const { year, month, day, hour, minute } = parts;
  const guess = Date.UTC(year, month - 1, day, hour, minute);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const readBackAsUtc = Object.fromEntries(
    formatter.formatToParts(new Date(guess)).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(readBackAsUtc.year),
    Number(readBackAsUtc.month) - 1,
    Number(readBackAsUtc.day),
    Number(readBackAsUtc.hour),
    Number(readBackAsUtc.minute),
    Number(readBackAsUtc.second),
  );
  const offset = asUtc - guess;
  return new Date(guess - offset);
}

/** The inverse of `zonedTimeToUtc`: reads a UTC instant back as wall-clock parts in `timeZone`. */
export function utcToZonedParts(date: Date, timeZone: string): WallClockParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}
