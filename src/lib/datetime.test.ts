import { describe, expect, it } from "vitest";

import { formatAnsweredAtManila } from "./datetime";

describe("formatAnsweredAtManila", () => {
  it("converts a UTC instant to Manila time (UTC+8)", () => {
    expect(formatAnsweredAtManila(new Date("2026-07-17T06:30:00Z"))).toBe(
      "17/07 at 14:30",
    );
  });

  it("rolls over to the next day when Manila is ahead of the UTC date", () => {
    expect(formatAnsweredAtManila(new Date("2026-07-17T16:05:00Z"))).toBe(
      "18/07 at 00:05",
    );
  });

  it("zero-pads single-digit day, month, hour, and minute", () => {
    expect(formatAnsweredAtManila(new Date("2026-01-02T00:03:00Z"))).toBe(
      "02/01 at 08:03",
    );
  });
});
