import {
  type AvatarColorName,
  isAvatarColorName,
  isAvatarEmoji,
} from "@/lib/avatar";
import { isThemeName, type ThemeName } from "@/lib/theme";

const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_EMOJI_OPTIONS = 30;

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
      value.length <= MAX_EMOJI_OPTIONS &&
      value.every((emoji) => isAvatarEmoji(emoji)))
  );
}

function normalizedDisplayName(value: unknown): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed && trimmed.length <= MAX_DISPLAY_NAME_LENGTH ? trimmed : null;
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
