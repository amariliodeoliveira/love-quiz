import { describe, expect, it } from "vitest";

import { cardFormSchema, cardQuestionPolicy } from "./card";

describe("cardFormSchema", () => {
  it("normalizes a valid card question", () => {
    expect(
      cardFormSchema.parse({ level: "dare", question: "  Sing a song  " }),
    ).toEqual({ level: "dare", question: "Sing a song" });
  });

  it("rejects an empty or oversized question", () => {
    expect(
      cardFormSchema.safeParse({ level: "1", question: "   " }).success,
    ).toBe(false);
    expect(
      cardFormSchema.safeParse({
        level: "1",
        question: "a".repeat(cardQuestionPolicy.maxLength + 1),
      }).success,
    ).toBe(false);
  });
});
