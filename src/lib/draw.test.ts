import { describe, expect, it } from "vitest";
import { pickRandomItem } from "./draw";

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
