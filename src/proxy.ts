import { NextResponse, type NextRequest } from "next/server";
import { parseSessionCookie, COOKIE_NAME } from "@/lib/auth";
import { LOGIN_PATH, PROFILE_PATH, GAME_PATH } from "@/lib/routes";

const PROTECTED_PREFIXES = [PROFILE_PATH, GAME_PATH];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === LOGIN_PATH;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = parseSessionCookie(cookie) !== null;

  if (!authenticated && isProtected && !isLoginPage) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && isLoginPage) {
    return NextResponse.redirect(new URL(GAME_PATH, request.url));
  }

  return NextResponse.next();
}

// Next requires `matcher` entries to be static string literals (parsed at build
// time), so these can't be derived from PROFILE_PATH/GAME_PATH — keep in sync by hand.
export const config = {
  matcher: ["/profile/:path*", "/truth-or-dare/:path*"],
};
