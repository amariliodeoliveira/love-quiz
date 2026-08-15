import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import type { Session } from "@/lib/db";

async function requireSession(): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

/** Wraps a route handler so it only runs for an authenticated request, returning 401 otherwise. */
export function withSession<Args extends unknown[]>(
  handler: (session: Session, ...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;
    return handler(session, ...args);
  };
}
