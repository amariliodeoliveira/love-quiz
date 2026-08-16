import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { updateUserProfile } from "@/lib/db";
import { parseProfileUpdate } from "@/lib/profile";

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

  const result = parseProfileUpdate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await updateUserProfile(session.userId, result.fields);

  return NextResponse.json({ ok: true });
});
