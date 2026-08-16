import { createHmac } from "node:crypto";

import { beforeEach, describe, expect, it } from "vitest";

import {
  CLAIM_WINDOW_HOURS,
  createSessionCookieValue,
  hashPassword,
  isClaimWindowExpired,
  parseSessionCookie,
  verifyPassword,
} from "./auth";
import type { Session } from "./db";

describe("isClaimWindowExpired", () => {
  const now = new Date("2026-01-10T00:00:00.000Z");

  it("has not expired right after account creation", () => {
    expect(isClaimWindowExpired(now, now)).toBe(false);
  });

  it("has not expired one hour before the window closes", () => {
    const createdAt = new Date(
      now.getTime() - (CLAIM_WINDOW_HOURS - 1) * 60 * 60 * 1000,
    );
    expect(isClaimWindowExpired(createdAt, now)).toBe(false);
  });

  it("has expired exactly at the window boundary", () => {
    const createdAt = new Date(
      now.getTime() - CLAIM_WINDOW_HOURS * 60 * 60 * 1000,
    );
    expect(isClaimWindowExpired(createdAt, now)).toBe(true);
  });

  it("has expired well past the window", () => {
    const createdAt = new Date(
      now.getTime() - (CLAIM_WINDOW_HOURS + 100) * 60 * 60 * 1000,
    );
    expect(isClaimWindowExpired(createdAt, now)).toBe(true);
  });
});

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret";
});

describe("hashPassword / verifyPassword", () => {
  it("verifies the correct password against its own hash", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(verifyPassword("wrong password", hash)).toBe(false);
  });

  it("produces a different salt (and hash) on every call", () => {
    const a = hashPassword("same password");
    const b = hashPassword("same password");
    expect(a).not.toBe(b);
  });

  it("rejects a malformed stored hash", () => {
    expect(verifyPassword("anything", "not-a-valid-hash")).toBe(false);
  });
});

describe("createSessionCookieValue / parseSessionCookie", () => {
  const session: Session = {
    userId: 1,
    username: "alice",
    role: "user",
    sessionVersion: 0,
  };

  it("round-trips a session through the signed cookie value", () => {
    const cookie = createSessionCookieValue(session);
    expect(parseSessionCookie(cookie)).toEqual(session);
  });

  it("returns null for an undefined cookie", () => {
    expect(parseSessionCookie(undefined)).toBeNull();
  });

  it("returns null when the signature has been tampered with", () => {
    const cookie = createSessionCookieValue(session);
    const [encoded] = cookie.split(".");
    expect(parseSessionCookie(`${encoded}.deadbeef`)).toBeNull();
  });

  it("returns null when the payload has been tampered with", () => {
    const cookie = createSessionCookieValue(session);
    const [, signature] = cookie.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({
        userId: 2,
        username: "mallory",
        role: "admin",
        sessionVersion: 0,
      }),
    ).toString("base64url");
    expect(parseSessionCookie(`${forgedPayload}.${signature}`)).toBeNull();
  });

  it("returns null for a cookie signed with a different secret", () => {
    const cookie = createSessionCookieValue(session);
    process.env.ADMIN_SESSION_SECRET = "a-different-secret";
    expect(parseSessionCookie(cookie)).toBeNull();
  });

  it("returns null when the role is not admin or user", () => {
    const encoded = Buffer.from(
      JSON.stringify({
        userId: 1,
        username: "alice",
        role: "superadmin",
        sessionVersion: 0,
      }),
    ).toString("base64url");
    const cookie = createSessionCookieValue({
      userId: 1,
      username: "alice",
      role: "superadmin" as Session["role"],
      sessionVersion: 0,
    });
    expect(cookie.startsWith(encoded)).toBe(true);
    expect(parseSessionCookie(cookie)).toBeNull();
  });

  it("returns null when a session has no version", () => {
    const encoded = Buffer.from(
      JSON.stringify({ userId: 1, username: "alice", role: "user" }),
    ).toString("base64url");
    const signature = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
      .update(encoded)
      .digest("hex");
    expect(parseSessionCookie(`${encoded}.${signature}`)).toBeNull();
  });

  it("returns null for a cookie missing the signature separator", () => {
    expect(parseSessionCookie("not-a-valid-cookie")).toBeNull();
  });
});
