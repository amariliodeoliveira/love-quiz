import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionCookie, COOKIE_NAME } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = isValidSessionCookie(cookie);

  if (!authenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (authenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
