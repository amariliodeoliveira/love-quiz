import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { isAvatarColorName, isAvatarEmoji } from "@/lib/avatar";
import { type ProfileFieldUpdate, updateUserProfile } from "@/lib/db";
import { isThemeName } from "@/lib/theme";

const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_EMOJI_OPTIONS = 30;

function isValidAvatarEmojiOptions(value: unknown): value is string[] | null {
  return (
    value === null ||
    (Array.isArray(value) &&
      value.length <= MAX_EMOJI_OPTIONS &&
      value.every((e) => isAvatarEmoji(e)))
  );
}

function normalizedDisplayName(value: unknown): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed && trimmed.length <= MAX_DISPLAY_NAME_LENGTH ? trimmed : null;
}

interface FieldValidator {
  raw: (body: Record<string, unknown>) => unknown;
  parse: (raw: unknown) => unknown;
  error: string;
}

/** One validator per assignable field, so the PATCH handler below can apply them in a
 * single loop instead of a run of near-identical if-blocks (each raw request value has
 * its own shape check, but the control flow around them is the same). */
const FIELD_VALIDATORS: Record<keyof ProfileFieldUpdate, FieldValidator> = {
  avatarColor: {
    raw: (b) => b.avatarColor,
    parse: (raw) => (isAvatarColorName(raw) ? raw : undefined),
    error: "Invalid color",
  },
  avatarEmoji: {
    raw: (b) => b.avatarEmoji,
    parse: (raw) => (raw === null || isAvatarEmoji(raw) ? raw : undefined),
    error: "Invalid emoji",
  },
  avatarEmojiOptions: {
    raw: (b) => b.avatarEmojiOptions,
    parse: (raw) => (isValidAvatarEmojiOptions(raw) ? raw : undefined),
    error: "Invalid emoji options",
  },
  theme: {
    raw: (b) => b.theme,
    parse: (raw) => (isThemeName(raw) ? raw : undefined),
    error: "Invalid theme",
  },
  displayName: {
    raw: (b) => b.displayName,
    parse: (raw) => normalizedDisplayName(raw) ?? undefined,
    error: "Invalid display name",
  },
};

export const PATCH = withSession(async (session, request: Request) => {
  const body = await request.json();
  const fields: ProfileFieldUpdate = {};

  for (const key of Object.keys(
    FIELD_VALIDATORS,
  ) as (keyof ProfileFieldUpdate)[]) {
    const { raw, parse, error } = FIELD_VALIDATORS[key];
    const rawValue = raw(body);
    if (rawValue === undefined) continue;

    const parsed = parse(rawValue);
    if (parsed === undefined) {
      return NextResponse.json({ error }, { status: 400 });
    }
    (fields as Record<string, unknown>)[key] = parsed;
  }

  await updateUserProfile(session.userId, fields);

  return NextResponse.json({ ok: true });
});
