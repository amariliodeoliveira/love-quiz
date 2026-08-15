import { NextResponse } from "next/server";

import {
  COOKIE_NAME,
  createSessionCookieValue,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  findUserByUsername,
  registerFailedLogin,
  resetFailedLogins,
  setUserPassword,
} from "@/lib/db";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !password
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const user = await findUserByUsername(username.trim());
  const invalidCredentials = NextResponse.json(
    { error: "Incorrect username or password" },
    { status: 401 },
  );

  if (!user) {
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
    // First login: the submitted password becomes the account's password.
    const passwordHash = hashPassword(password);
    await setUserPassword(user.id, passwordHash);
  } else if (!verifyPassword(password, user.passwordHash)) {
    await registerFailedLogin(user.id);
    return invalidCredentials;
  }

  await resetFailedLogins(user.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    COOKIE_NAME,
    createSessionCookieValue({
      userId: user.id,
      username: user.username,
      role: user.role,
    }),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  );
  return response;
}
