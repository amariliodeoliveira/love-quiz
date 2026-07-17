import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { proxy } from "./proxy";
import { createSessionCookieValue, COOKIE_NAME } from "@/lib/auth";
import type { Session } from "@/lib/db";

const BASE_URL = "http://localhost";
const session: Session = { userId: 1, username: "alice", role: "user" };

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret";
});

function requestFor(path: string, authenticated = false) {
  const headers: Record<string, string> = {};
  if (authenticated) {
    headers.cookie = `${COOKIE_NAME}=${createSessionCookieValue(session)}`;
  }
  return new NextRequest(new URL(path, BASE_URL), { headers });
}

function isPassThrough(response: ReturnType<typeof proxy>) {
  return (response as Response).headers.get("x-middleware-next") === "1";
}

function redirectLocation(response: ReturnType<typeof proxy>) {
  const res = response as Response;
  if (res.status !== 307) return null;
  return new URL(res.headers.get("location")!);
}

describe("proxy", () => {
  it("lets an unauthenticated request through to an unprotected path", () => {
    expect(isPassThrough(proxy(requestFor("/")))).toBe(true);
  });

  it("redirects an unauthenticated request away from a protected page", () => {
    const location = redirectLocation(proxy(requestFor("/truth-or-dare")));
    expect(location?.pathname).toBe("/profile/login");
    expect(location?.searchParams.get("from")).toBe("/truth-or-dare");
  });

  it("preserves nested paths under a protected prefix in the redirect", () => {
    const location = redirectLocation(proxy(requestFor("/profile/settings")));
    expect(location?.searchParams.get("from")).toBe("/profile/settings");
  });

  it("lets an unauthenticated request reach the login page itself", () => {
    expect(isPassThrough(proxy(requestFor("/profile/login")))).toBe(true);
  });

  it("lets an authenticated request through to a protected page", () => {
    expect(isPassThrough(proxy(requestFor("/truth-or-dare", true)))).toBe(true);
    expect(isPassThrough(proxy(requestFor("/profile", true)))).toBe(true);
  });

  it("bounces an authenticated request away from the login page", () => {
    const location = redirectLocation(proxy(requestFor("/profile/login", true)));
    expect(location?.pathname).toBe("/truth-or-dare");
  });

  it("treats a request with a tampered session cookie as unauthenticated", () => {
    const request = new NextRequest(new URL("/profile", BASE_URL), {
      headers: { cookie: `${COOKIE_NAME}=garbage.signature` },
    });
    const location = redirectLocation(proxy(request));
    expect(location?.pathname).toBe("/profile/login");
  });
});
