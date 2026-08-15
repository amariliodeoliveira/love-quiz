import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { isAvatarColorName } from "@/lib/avatar";
import { updateAvatarColor, updateTheme } from "@/lib/db";
import { isThemeName } from "@/lib/theme";

export const PATCH = withSession(async (session, request: Request) => {
  const { avatarColor, theme } = await request.json();

  if (avatarColor !== undefined) {
    if (!isAvatarColorName(avatarColor)) {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }
    await updateAvatarColor(session.userId, avatarColor);
  }

  if (theme !== undefined) {
    if (!isThemeName(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }
    await updateTheme(session.userId, theme);
  }

  return NextResponse.json({ ok: true });
});
