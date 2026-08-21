import { describe, expect, it } from "vitest";

import { buildPrompt, pickRandomTruthLevel } from "./generate";

describe("pickRandomTruthLevel", () => {
  it("only ever returns a truth level, never a dare", () => {
    for (let i = 0; i < 50; i++) {
      expect(["1", "2", "3"]).toContain(pickRandomTruthLevel());
    }
  });
});

describe("buildPrompt", () => {
  it("asks for a dare when the level is dare", () => {
    const prompt = buildPrompt({ summary: "", recentQuestions: [] }, "dare");
    expect(prompt).toContain("a dare");
  });

  it("asks for a truth for a numbered level", () => {
    const prompt = buildPrompt({ summary: "", recentQuestions: [] }, "2");
    expect(prompt).toContain("a truth question");
  });

  it("grounds both card types in the game's relationship and safety rules", () => {
    const truthPrompt = buildPrompt({ summary: "", recentQuestions: [] }, "3");
    const darePrompt = buildPrompt(
      { summary: "", recentQuestions: [] },
      "dare",
    );

    for (const prompt of [truthPrompt, darePrompt]) {
      expect(prompt).toContain(
        "without assuming their gender, relationship history, sexual experience",
      );
      expect(prompt).toContain(
        "anything that requires either player to describe something they have done",
      );
      expect(prompt).toContain(
        "No humiliation, degradation, coercion, threats, danger",
      );
    }
    expect(truthPrompt).toContain(
      "Truths may explore intimacy, curiosity, expectations",
    );
    expect(darePrompt).toContain(
      "A dare is a concrete, optional-feeling challenge and not another question",
    );
  });

  it("omits the avoid-list section when there is no context yet", () => {
    const prompt = buildPrompt({ summary: "", recentQuestions: [] }, "1");
    expect(prompt).not.toContain("Do not repeat");
  });

  it("includes the summary and recent questions in the avoid-list", () => {
    const prompt = buildPrompt(
      {
        summary: "already asked about travel",
        recentQuestions: ["What's your favorite dish?"],
      },
      "1",
    );
    expect(prompt).toContain("already asked about travel");
    expect(prompt).toContain("What's your favorite dish?");
  });
});
