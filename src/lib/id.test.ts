import { describe, expect, it } from "vitest";
import { parseId } from "./id";

describe("parseId", () => {
  it("parses a valid integer string", () => {
    expect(parseId("42")).toBe(42);
  });

  it("rejects a non-numeric string", () => {
    expect(parseId("abc")).toBeNull();
  });

  it("rejects a decimal value", () => {
    expect(parseId("1.5")).toBeNull();
  });

  it("rejects a numeric string mixed with letters", () => {
    expect(parseId("12abc")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(parseId("")).toBeNull();
  });
});
