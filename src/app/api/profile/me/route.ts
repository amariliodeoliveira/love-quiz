import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { isAvatarColorName, isAvatarEmoji } from "@/lib/avatar";
import {
  updateAvatarColor,
  updateAvatarEmoji,
  updateDisplayName,
  updateTheme,
} from "@/lib/db";
import { isThemeName } from "@/lib/theme";

const MAX_DISPLAY_NAME_LENGTH = 40;

export const PATCH = withSession(async (session, request: Request) => {
  const { avatarColor, avatarEmoji, theme, displayName } = await request.json();

  if (avatarColor !== undefined) {
    if (!isAvatarColorName(avatarColor)) {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }
    await updateAvatarColor(session.userId, avatarColor);
  }

  if (avatarEmoji !== undefined) {
    if (avatarEmoji !== null && !isAvatarEmoji(avatarEmoji)) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }
    await updateAvatarEmoji(session.userId, avatarEmoji);
  }

  if (theme !== undefined) {
    if (!isThemeName(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }
    await updateTheme(session.userId, theme);
  }

  if (displayName !== undefined) {
    const trimmed = typeof displayName === "string" ? displayName.trim() : "";
    if (!trimmed || trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
      return NextResponse.json(
        { error: "Invalid display name" },
        { status: 400 },
      );
    }
    await updateDisplayName(session.userId, trimmed);
  }

  return NextResponse.json({ ok: true });
});
