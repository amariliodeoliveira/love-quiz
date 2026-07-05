import { NextResponse } from "next/server";
import { updateAvatarColor } from "@/lib/db";
import { requireSession } from "@/lib/api";
import { isAvatarColorName } from "@/lib/avatar";

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { avatarColor } = await request.json();
  if (!isAvatarColorName(avatarColor)) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  await updateAvatarColor(session.userId, avatarColor);
  return NextResponse.json({ ok: true });
}
