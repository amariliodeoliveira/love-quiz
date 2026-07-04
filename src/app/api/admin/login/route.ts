import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionCookieValue,
  COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (typeof password !== "string" || !checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
