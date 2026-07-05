import { NextResponse, type NextRequest } from "next/server";
import { parseSessionCookie, COOKIE_NAME } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/profile/login";
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = parseSessionCookie(cookie) !== null;

  if (!authenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/profile/login", request.url));
  }

  if (authenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
