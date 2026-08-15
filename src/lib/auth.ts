import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";

import type { Role, Session } from "@/lib/db";

const COOKIE_NAME = "admin_session";
const SCRYPT_KEYLEN = 64;

/** How long an account with no password (freshly provisioned by an admin, username
 * shared out-of-band) can be "claimed" by whoever submits a password first. Past this
 * window, first-login claiming is blocked — narrows the window in which a guessed
 * username could be hijacked before its real owner ever logs in. */
export const CLAIM_WINDOW_HOURS = 48;

export function isClaimWindowExpired(createdAt: Date, now: Date): boolean {
  return (
    now.getTime() - createdAt.getTime() >= CLAIM_WINDOW_HOURS * 60 * 60 * 1000
  );
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derived = scryptSync(password, salt, keyBuffer.length);
  return (
    derived.length === keyBuffer.length && timingSafeEqual(derived, keyBuffer)
  );
}

export function createSessionCookieValue(session: Session): string {
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function parseSessionCookie(
  cookieValue: string | undefined,
): Session | null {
  if (!cookieValue) return null;
  const [encoded, signature] = cookieValue.split(".");
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    if (
      typeof payload?.userId !== "number" ||
      typeof payload?.username !== "string" ||
      (payload.role !== "admin" && payload.role !== "user")
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return parseSessionCookie(cookieStore.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME };
