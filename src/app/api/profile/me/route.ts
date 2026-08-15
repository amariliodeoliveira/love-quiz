import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { isAvatarColorName } from "@/lib/avatar";
import { updateAvatarColor } from "@/lib/db";

export const PATCH = withSession(async (session, request: Request) => {
  const { avatarColor } = await request.json();
  if (!isAvatarColorName(avatarColor)) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  await updateAvatarColor(session.userId, avatarColor);
  return NextResponse.json({ ok: true });
});
