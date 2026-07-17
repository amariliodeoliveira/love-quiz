import { describe, expect, it } from "vitest";
import { breakdownDuration, msUntil, utcToZonedParts, zonedTimeToUtc } from "./countdown";

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
