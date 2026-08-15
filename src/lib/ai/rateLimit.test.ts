import { describe, expect, it } from "vitest";

import {
  AI_GENERATE_COOLDOWN_SECONDS,
  isAiGenerateRateLimited,
} from "./rateLimit";

describe("isAiGenerateRateLimited", () => {
  const now = new Date("2026-01-10T00:00:00.000Z");

  it("is not limited when no AI card has ever been generated", () => {
    expect(isAiGenerateRateLimited(null, now)).toBe(false);
  });

  it("is limited right after a generation", () => {
    expect(isAiGenerateRateLimited(now, now)).toBe(true);
  });

  it("is limited one second before the cooldown ends", () => {
    const lastGeneratedAt = new Date(
      now.getTime() - (AI_GENERATE_COOLDOWN_SECONDS - 1) * 1000,
    );
    expect(isAiGenerateRateLimited(lastGeneratedAt, now)).toBe(true);
  });

  it("is not limited exactly at the cooldown boundary", () => {
    const lastGeneratedAt = new Date(
      now.getTime() - AI_GENERATE_COOLDOWN_SECONDS * 1000,
    );
    expect(isAiGenerateRateLimited(lastGeneratedAt, now)).toBe(false);
  });

  it("is not limited well past the cooldown", () => {
    const lastGeneratedAt = new Date(
      now.getTime() - (AI_GENERATE_COOLDOWN_SECONDS + 3600) * 1000,
    );
    expect(isAiGenerateRateLimited(lastGeneratedAt, now)).toBe(false);
  });
});
