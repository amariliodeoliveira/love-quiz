import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import type { Session } from "@/lib/db";

/** Resolves the current session, or an already-built 401 response if there isn't one. */
export async function requireSession(): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
