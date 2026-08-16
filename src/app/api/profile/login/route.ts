import { NextResponse } from "next/server";

import {
  COOKIE_NAME,
  createSession,
  createSessionCookieValue,
  hashPassword,
  isClaimWindowExpired,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import {
  findUserByUsername,
  registerFailedLogin,
  resetFailedLogins,
  setUserPassword,
} from "@/lib/db";
import { loginFormSchema } from "@/lib/login";
import { newPasswordSchema, passwordPolicy } from "@/lib/password";

// A valid-format but unusable hash, hashed once at module load. Used to run
// verifyPassword's real scrypt work even when no user was found, so an unknown
// username doesn't return measurably faster than a known one with a wrong password —
// otherwise response timing would leak which usernames exist.
const DECOY_HASH = hashPassword(randomDecoyPassword());

function randomDecoyPassword(): string {
  return Math.random().toString(36);
}

export async function POST(request: Request) {
  const parsed = loginFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const { username, password, rememberMe } = parsed.data;

  const user = await findUserByUsername(username.trim());
  const invalidCredentials = NextResponse.json(
    { error: "Incorrect username or password" },
    { status: 401 },
  );

  if (!user) {
    verifyPassword(password, DECOY_HASH);
    return invalidCredentials;
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60_000,
    );
    return NextResponse.json(
      {
        error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429 },
    );
  }

  if (user.passwordHash === null) {
    if (isClaimWindowExpired(user.createdAt, new Date())) {
      return NextResponse.json(
        {
          error:
            "This account was never activated in time. Ask an admin to reset it.",
        },
        { status: 401 },
      );
    }
    if (!newPasswordSchema.safeParse(password).success) {
      return NextResponse.json(
        {
          error: `Choose a password between ${passwordPolicy.minLength} and ${passwordPolicy.maxLength} characters`,
        },
        { status: 400 },
      );
    }
    // First login: the submitted password becomes the account's password.
    const passwordHash = hashPassword(password);
    await setUserPassword(user.id, passwordHash);
  } else if (!verifyPassword(password, user.passwordHash)) {
    await registerFailedLogin(user.id);
    return invalidCredentials;
  }

  await resetFailedLogins(user.id);

  const session = createSession(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionVersion: user.sessionVersion,
    },
    rememberMe,
  );
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    COOKIE_NAME,
    createSessionCookieValue(session),
    sessionCookieOptions(session.expiresAt),
  );
  return response;
}
