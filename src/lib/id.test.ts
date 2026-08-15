import { describe, expect, it } from "vitest";

import { parseCardRef, parseId } from "./id";

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

describe("parseCardRef", () => {
  it("parses a plain numeric id as a manual card", () => {
    expect(parseCardRef("42")).toEqual({ source: "manual", id: 42 });
  });

  it("parses an ai-prefixed id as an AI card", () => {
    expect(parseCardRef("ai-42")).toEqual({ source: "ai", id: 42 });
  });

  it("rejects a non-numeric manual id", () => {
    expect(parseCardRef("abc")).toBeNull();
  });

  it("rejects a non-numeric ai id", () => {
    expect(parseCardRef("ai-abc")).toBeNull();
  });

  it("rejects an empty ai id", () => {
    expect(parseCardRef("ai-")).toBeNull();
  });
});
