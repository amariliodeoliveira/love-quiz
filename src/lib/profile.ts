import { z } from "zod";

import {
  type AvatarColorName,
  isAvatarColorName,
  isAvatarEmoji,
  MAX_AVATAR_EMOJI_OPTIONS,
} from "@/lib/avatar";
import { isThemeName, type ThemeName } from "@/lib/theme";

export const displayNamePolicy = {
  maxLength: 40,
} as const;

/** Client-side contract for the text field in profile settings. */
export const profileEditorSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a display name")
    .max(
      displayNamePolicy.maxLength,
      `Use at most ${displayNamePolicy.maxLength} characters`,
    ),
});

export type ProfileEditorValues = z.infer<typeof profileEditorSchema>;

export interface ProfileFieldUpdate {
  displayName?: string;
  avatarColor?: AvatarColorName;
  avatarEmoji?: string | null;
  avatarEmojiOptions?: string[] | null;
  theme?: ThemeName;
}

export type ProfileUpdateParseResult =
  { ok: true; fields: ProfileFieldUpdate } | { ok: false; error: string };

interface FieldValidator {
  raw: (body: Record<string, unknown>) => unknown;
  parse: (raw: unknown) => unknown;
  error: string;
}

function isValidAvatarEmojiOptions(value: unknown): value is string[] | null {
  return (
    value === null ||
    (Array.isArray(value) &&
      value.length <= MAX_AVATAR_EMOJI_OPTIONS &&
      new Set(value).size === value.length &&
      value.every((emoji) => isAvatarEmoji(emoji)))
  );
}

function normalizedDisplayName(value: unknown): string | null {
  const parsed = profileEditorSchema.shape.displayName.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const FIELD_VALIDATORS: Record<keyof ProfileFieldUpdate, FieldValidator> = {
  avatarColor: {
    raw: (body) => body.avatarColor,
    parse: (raw) => (isAvatarColorName(raw) ? raw : undefined),
    error: "Invalid color",
  },
  avatarEmoji: {
    raw: (body) => body.avatarEmoji,
    parse: (raw) => (raw === null || isAvatarEmoji(raw) ? raw : undefined),
    error: "Invalid emoji",
  },
  avatarEmojiOptions: {
    raw: (body) => body.avatarEmojiOptions,
    parse: (raw) => (isValidAvatarEmojiOptions(raw) ? raw : undefined),
    error: "Invalid emoji options",
  },
  theme: {
    raw: (body) => body.theme,
    parse: (raw) => (isThemeName(raw) ? raw : undefined),
    error: "Invalid theme",
  },
  displayName: {
    raw: (body) => body.displayName,
    parse: (raw) => normalizedDisplayName(raw) ?? undefined,
    error: "Invalid display name",
  },
};

export function parseProfileUpdate(body: unknown): ProfileUpdateParseResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const fields: ProfileFieldUpdate = {};
  for (const key of Object.keys(
    FIELD_VALIDATORS,
  ) as (keyof ProfileFieldUpdate)[]) {
    // `key` comes from the fixed validator table, not the request body.
    // eslint-disable-next-line security/detect-object-injection
    const { raw, parse, error } = FIELD_VALIDATORS[key];
    const rawValue = raw(body as Record<string, unknown>);
    if (rawValue === undefined) continue;

    const parsed = parse(rawValue);
    if (parsed === undefined) return { ok: false, error };

    // The same fixed key selects both the validator and destination field.
    // eslint-disable-next-line security/detect-object-injection
    (fields as Record<string, unknown>)[key] = parsed;
  }

  return { ok: true, fields };
}
