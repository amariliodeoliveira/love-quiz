import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import {
  COOKIE_NAME,
  createSessionCookieValue,
  hashPassword,
  SESSION_COOKIE_OPTIONS,
  verifyPassword,
} from "@/lib/auth";
import { changeUserPassword, getUserById, registerFailedLogin } from "@/lib/db";
import { parsePasswordChange } from "@/lib/password";

export const PATCH = withSession(async (session, request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const result = parsePasswordChange(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const user = await getUserById(session.userId);
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  if (!verifyPassword(result.value.currentPassword, user.passwordHash)) {
    await registerFailedLogin(user.id);
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  const sessionVersion = await changeUserPassword(
    user.id,
    user.passwordHash,
    hashPassword(result.value.newPassword),
  );
  if (sessionVersion === null) {
    return NextResponse.json(
      { error: "Password changed elsewhere. Please sign in again." },
      { status: 409 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    COOKIE_NAME,
    createSessionCookieValue({ ...session, sessionVersion }),
    SESSION_COOKIE_OPTIONS,
  );
  return response;
});
