import { describe, expect, it } from "vitest";

import { buildSummaryPrompt } from "./context";

describe("buildSummaryPrompt", () => {
  it("asks to start from scratch when there is no previous summary", () => {
    const prompt = buildSummaryPrompt("", ["What's your favorite place?"]);
    expect(prompt).toContain("There is no summary yet");
    expect(prompt).toContain("What's your favorite place?");
  });

  it("includes the previous summary when there is one", () => {
    const prompt = buildSummaryPrompt("already asked about travel", [
      "What's your favorite dish?",
    ]);
    expect(prompt).toContain("already asked about travel");
    expect(prompt).toContain("What's your favorite dish?");
  });
});
