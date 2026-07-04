import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_VALUE = "authenticated";

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

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionCookieValue(): string {
  const signature = sign(SESSION_VALUE);
  return `${SESSION_VALUE}.${signature}`;
}

export function isValidSessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [value, signature] = cookieValue.split(".");
  if (!value || !signature) return false;
  const expectedSignature = sign(value);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false;
  return value === SESSION_VALUE && timingSafeEqual(a, b);
}

export { COOKIE_NAME };
