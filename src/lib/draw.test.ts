import { describe, expect, it } from "vitest";

import { pickNextDare, pickRandomItem } from "./draw";

describe("pickRandomItem", () => {
  it("returns null for an empty pool", () => {
    expect(pickRandomItem([])).toBeNull();
  });

  it("returns the only item in a single-item pool regardless of the random value", () => {
    expect(pickRandomItem(["only"], () => 0)).toBe("only");
    expect(pickRandomItem(["only"], () => 0.999)).toBe("only");
  });

  it("picks the first item when random() returns 0", () => {
    expect(pickRandomItem(["a", "b", "c"], () => 0)).toBe("a");
  });

  it("picks the last item when random() returns just under 1", () => {
    expect(pickRandomItem(["a", "b", "c"], () => 0.9999)).toBe("c");
  });

  it("picks the middle item for a mid-range random value", () => {
    expect(pickRandomItem(["a", "b", "c"], () => 0.5)).toBe("b");
  });
});

describe("pickNextDare", () => {
  const dares = [{ id: "1" }, { id: "2" }, { id: "3" }];

  it("returns null when there are no dares at all", () => {
    expect(pickNextDare([], "1")).toBeNull();
  });

  it("excludes the currently shown dare when others are available", () => {
    expect(pickNextDare(dares, "2", () => 0)).toEqual({ id: "1" });
    expect(pickNextDare(dares, "2", () => 0.99)).toEqual({ id: "3" });
  });

  it("falls back to repeating the same dare when it's the only one available", () => {
    const onlyOne = [{ id: "solo" }];
    expect(pickNextDare(onlyOne, "solo")).toEqual({ id: "solo" });
  });

  it("picks from the full pool when there's nothing to exclude yet", () => {
    expect(pickNextDare(dares, undefined, () => 0)).toEqual({ id: "1" });
  });
});
