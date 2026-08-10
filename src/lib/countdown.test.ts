import { describe, expect, it } from "vitest";
import {
  breakdownDuration,
  msUntil,
  remainingMsAt,
  toCountdownDisplay,
  utcToZonedParts,
  zonedTimeToUtc,
} from "./countdown";

describe("breakdownDuration", () => {
  it("breaks down a duration with all units present", () => {
    const ms = 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5 * 1000;
    expect(breakdownDuration(ms)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      isPast: false,
    });
  });

  it("treats exactly zero as past", () => {
    expect(breakdownDuration(0).isPast).toBe(true);
  });

  it("treats a negative duration as past and reports its absolute size", () => {
    const oneHourAgo = -3_600_000;
    const result = breakdownDuration(oneHourAgo);
    expect(result.isPast).toBe(true);
    expect(result).toMatchObject({ days: 0, hours: 1, minutes: 0, seconds: 0 });
  });

  it("rolls over correctly just under a day boundary", () => {
    const almostADay = 86_400_000 - 1000;
    expect(breakdownDuration(almostADay)).toEqual({
      days: 0,
      hours: 23,
      minutes: 59,
      seconds: 59,
      isPast: false,
    });
  });
});

describe("msUntil", () => {
  it("returns a positive value for a target in the future", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const target = new Date("2026-01-02T00:00:00.000Z");
    expect(msUntil(target, now)).toBe(86_400_000);
  });

  it("returns a negative value for a target in the past", () => {
    const now = new Date("2026-01-02T00:00:00.000Z");
    const target = new Date("2026-01-01T00:00:00.000Z");
    expect(msUntil(target, now)).toBe(-86_400_000);
  });
});

describe("toCountdownDisplay", () => {
  it("returns null when no countdown is configured — the normal 'not set yet' state", () => {
    expect(toCountdownDisplay(null)).toBeNull();
  });

  it("maps a configured countdown to display shape with a positive msRemaining", () => {
    const future = new Date(Date.now() + 60_000);
    const result = toCountdownDisplay({
      targetAt: future,
      timeZone: "America/Sao_Paulo",
      location: "Lisbon, Portugal",
      label: "Together again in",
    });
    expect(result).toMatchObject({
      label: "Together again in",
      location: "Lisbon, Portugal",
      timeZone: "America/Sao_Paulo",
      targetAtIso: future.toISOString(),
    });
    expect(result!.msRemaining).toBeGreaterThan(0);
  });

  it("reports a negative msRemaining once the target has already passed", () => {
    const past = new Date(Date.now() - 60_000);
    const result = toCountdownDisplay({
      targetAt: past,
      timeZone: "UTC",
      location: null,
      label: "Together again in",
    });
    expect(result!.msRemaining).toBeLessThan(0);
  });
});

describe("zonedTimeToUtc", () => {
  it("converts noon in UTC as a no-op", () => {
    const result = zonedTimeToUtc({ year: 2026, month: 1, day: 15, hour: 12, minute: 0 }, "UTC");
    expect(result.toISOString()).toBe("2026-01-15T12:00:00.000Z");
  });

  it("converts noon Eastern Standard Time (winter, UTC-5)", () => {
    const result = zonedTimeToUtc(
      { year: 2026, month: 1, day: 15, hour: 12, minute: 0 },
      "America/New_York",
    );
    expect(result.toISOString()).toBe("2026-01-15T17:00:00.000Z");
  });

  it("converts noon Eastern Daylight Time (summer, UTC-4) — DST is respected", () => {
    const result = zonedTimeToUtc(
      { year: 2026, month: 7, day: 15, hour: 12, minute: 0 },
      "America/New_York",
    );
    expect(result.toISOString()).toBe("2026-07-15T16:00:00.000Z");
  });

  it("handles a timezone ahead of UTC", () => {
    const result = zonedTimeToUtc(
      { year: 2026, month: 3, day: 5, hour: 9, minute: 30 },
      "Asia/Tokyo",
    );
    // Tokyo is UTC+9 year-round (no DST).
    expect(result.toISOString()).toBe("2026-03-05T00:30:00.000Z");
  });
});

describe("utcToZonedParts", () => {
  it("is the inverse of zonedTimeToUtc across a DST boundary", () => {
    const parts = { year: 2026, month: 7, day: 15, hour: 12, minute: 0 };
    const utc = zonedTimeToUtc(parts, "America/New_York");
    expect(utcToZonedParts(utc, "America/New_York")).toEqual(parts);
  });

  it("reads a known UTC instant back correctly in Asia/Tokyo", () => {
    const utc = new Date("2026-03-05T00:30:00.000Z");
    expect(utcToZonedParts(utc, "Asia/Tokyo")).toEqual({
      year: 2026,
      month: 3,
      day: 5,
      hour: 9,
      minute: 30,
    });
  });
});

describe("remainingMsAt", () => {
  it("counts down as time passes since the anchor", () => {
    const anchoredAt = 1_000_000;
    const msRemaining = 60_000;
    expect(remainingMsAt(msRemaining, anchoredAt, anchoredAt)).toBe(60_000);
    expect(remainingMsAt(msRemaining, anchoredAt, anchoredAt + 10_000)).toBe(50_000);
  });

  it("gives the same result regardless of when the caller mounted, as long as anchoredAt matches", () => {
    const anchoredAt = 1_000_000;
    const msRemaining = 5 * 60_000;
    const now = anchoredAt + 3 * 60_000;

    const headerMountedAtLoad = remainingMsAt(msRemaining, anchoredAt, now);
    const modalMountedLater = remainingMsAt(msRemaining, anchoredAt, now);

    expect(modalMountedLater).toBe(headerMountedAtLoad);
  });

  it("goes negative past the target, consistent with breakdownDuration treating <= 0 as past", () => {
    const anchoredAt = 1_000_000;
    const result = remainingMsAt(60_000, anchoredAt, anchoredAt + 90_000);
    expect(result).toBe(-30_000);
    expect(breakdownDuration(result).isPast).toBe(true);
  });
});
