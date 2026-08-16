import { neon } from "@neondatabase/serverless";

import type { Card, Level } from "@/data/cards";
import type { CardRef } from "@/lib/id";
import type { ProfileFieldUpdate } from "@/lib/profile";
import type { ThemeName } from "@/lib/theme";

// @vercel/postgres is deprecated (Vercel Postgres was discontinued in favor of the
// Marketplace's native Neon integration) — this project's database is Neon directly, so
// this is Neon's own driver. It's HTTP-based (no connection pool to hold open), so
// POSTGRES_URL (this project's pooled/PgBouncer string) works the same as any other Neon
// connection string here — see .agents/references/database-guidelines.md for what each env var is for.
//
// The raw `neon()` call has no way to type an individual query's row shape (unlike
// @vercel/postgres's `sql<Row>\`...\`` generic), so this thin wrapper restores that —
// every call site below is otherwise unchanged.
//
// Built lazily (on first query, not on module import): unlike @vercel/postgres's `sql`,
// `neon()` throws immediately if the connection string is missing — and this module is
// imported (for its types/other exports) by code that never actually queries the DB in
// tests, where POSTGRES_URL isn't set on purpose (see .agents/references/testing-guidelines.md).
let rawSql: ReturnType<typeof neon> | undefined;

function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  rawSql ??= neon(process.env.POSTGRES_URL!, { fullResults: true });
  return rawSql(strings, ...values) as Promise<{
    rows: T[];
    rowCount: number | null;
  }>;
}

export type Role = "admin" | "user";

// Postgres timestamp columns come back as strings from the driver but are normalized to Date via
// mapCardRow/mapAiCardRow/mapUserRow before leaving this module.
type RawTimestamp = string | Date | null;

export interface DbUser {
  id: number;
  username: string;
  displayName: string;
  passwordHash: string | null;
  role: Role;
  avatarColor: string;
  avatarEmoji: string | null;
  avatarEmojiOptions: string[] | null;
  failedAttempts: number;
  lockedUntil: Date | null;
  sessionVersion: number;
  createdAt: Date;
  theme: ThemeName;
}

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

export interface DbCard {
  id: number;
  level: Level;
  question: string;
  position: number;
  userId: number | null;
  answeredAt: Date | null;
  timesCompleted: number;
}

interface CardRow {
  id: number;
  level: Level;
  question: string;
  position: number;
  user_id: number | null;
  answered_at: RawTimestamp;
  times_completed: number;
}

function mapCardRow(row: CardRow): DbCard {
  return {
    id: row.id,
    level: row.level,
    question: row.question,
    position: row.position,
    userId: row.user_id,
    answeredAt: row.answered_at ? new Date(row.answered_at) : null,
    timesCompleted: row.times_completed,
  };
}

export interface Countdown {
  targetAt: Date;
  timeZone: string;
  location: string | null;
  label: string;
}

export interface Session {
  userId: number;
  username: string;
  role: Role;
  sessionVersion: number;
}

interface UserRow {
  id: number;
  username: string;
  display_name: string;
  password_hash: string | null;
  role: Role;
  avatar_color: string;
  avatar_emoji: string | null;
  avatar_emoji_options: string[] | null;
  failed_attempts: number;
  locked_until: RawTimestamp;
  session_version: number;
  created_at: RawTimestamp;
  theme: ThemeName;
}

function mapUserRow(row: UserRow): DbUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    role: row.role,
    avatarColor: row.avatar_color,
    avatarEmoji: row.avatar_emoji,
    avatarEmojiOptions: row.avatar_emoji_options,
    failedAttempts: row.failed_attempts,
    lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
    sessionVersion: row.session_version,
    createdAt: new Date(row.created_at ?? 0),
    theme: row.theme,
  };
}

export async function findUserByUsername(
  username: string,
): Promise<DbUser | null> {
  const { rows } = await sql<UserRow>`
    SELECT id, username, display_name, password_hash, role, avatar_color, avatar_emoji, avatar_emoji_options, failed_attempts, locked_until, session_version, created_at, theme
    FROM users
    WHERE username = ${username};
  `;
  const row = rows[0];
  return row ? mapUserRow(row) : null;
}

export async function getUserById(id: number): Promise<DbUser | null> {
  const { rows } = await sql<UserRow>`
    SELECT id, username, display_name, password_hash, role, avatar_color, avatar_emoji, avatar_emoji_options, failed_attempts, locked_until, session_version, created_at, theme
    FROM users
    WHERE id = ${id};
  `;
  const row = rows[0];
  return row ? mapUserRow(row) : null;
}

export async function setUserPassword(
  userId: number,
  passwordHash: string,
): Promise<void> {
  await sql`
    UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId};
  `;
}

/** Changes a password only if the hash verified by the caller is still current. This
 * prevents concurrent password changes from silently overwriting each other and clears
 * the shared failed-password counter after a successful reauthentication. */
export async function changeUserPassword(
  userId: number,
  currentPasswordHash: string,
  newPasswordHash: string,
): Promise<number | null> {
  const { rows } = await sql<{ session_version: number }>`
    UPDATE users
    SET password_hash = ${newPasswordHash}, failed_attempts = 0, locked_until = NULL,
        session_version = session_version + 1
    WHERE id = ${userId} AND password_hash = ${currentPasswordHash};
    RETURNING session_version;
  `;
  return rows[0]?.session_version ?? null;
}

/** Atomically increments failed attempts and locks the account once the threshold is hit. */
export async function registerFailedLogin(userId: number): Promise<void> {
  await sql`
    UPDATE users
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE
          WHEN failed_attempts + 1 >= ${MAX_LOGIN_ATTEMPTS}
            THEN now() + make_interval(mins => ${LOCKOUT_MINUTES})
          ELSE locked_until
        END
    WHERE id = ${userId};
  `;
}

export async function resetFailedLogins(userId: number): Promise<void> {
  await sql`
    UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ${userId};
  `;
}

const PROFILE_FIELD_COLUMNS = new Map<keyof ProfileFieldUpdate, string>([
  ["displayName", "display_name"],
  ["avatarColor", "avatar_color"],
  ["avatarEmoji", "avatar_emoji"],
  ["avatarEmojiOptions", "avatar_emoji_options"],
  ["theme", "theme"],
]);

/** A single UPDATE for however many profile fields changed in one request (Edit
 * profile's form submits displayName + avatarColor + avatarEmoji + avatarEmojiOptions
 * together; the theme picker submits theme alone) — one Postgres round trip per
 * request instead of one per field. Column names come only from the fixed
 * PROFILE_FIELD_COLUMNS map above, never from request input, so building the SET
 * clause as a string stays injection-safe; values still go through $-placeholders
 * (see .query()'s parameterized form — the `sql` tagged-template wrapper can't take a
 * dynamic column list). */
export async function updateUserProfile(
  userId: number,
  fields: ProfileFieldUpdate,
): Promise<void> {
  const entries = Object.entries(fields).filter(
    ([, value]) => value !== undefined,
  ) as [keyof ProfileFieldUpdate, unknown][];
  if (entries.length === 0) return;

  const setClauses = entries.map(
    ([key], i) => `${PROFILE_FIELD_COLUMNS.get(key)} = $${i + 1}`,
  );
  const params = entries.map(([, value]) => value);
  params.push(userId);

  rawSql ??= neon(process.env.POSTGRES_URL!, { fullResults: true });
  await rawSql.query(
    `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${params.length};`,
    params,
  );
}

export async function getAllCards(): Promise<DbCard[]> {
  const { rows } = await sql<CardRow>`
    SELECT id, level, question, position, user_id, answered_at, times_completed
    FROM cards
    ORDER BY level, position;
  `;
  return rows.map((row) => mapCardRow(row));
}

export async function getCardsForUser(session: Session): Promise<DbCard[]> {
  if (session.role === "admin") {
    return getAllCards();
  }
  const { rows } = await sql<CardRow>`
    SELECT id, level, question, position, user_id, answered_at, times_completed
    FROM cards
    WHERE user_id = ${session.userId}
    ORDER BY level, position;
  `;
  return rows.map((row) => mapCardRow(row));
}

export async function createCard(
  level: Level,
  question: string,
  userId: number,
): Promise<DbCard> {
  const { rows: maxRows } = await sql<{ max: number | null }>`
    SELECT MAX(position) AS max FROM cards WHERE level = ${level};
  `;
  const nextPosition = (maxRows[0].max ?? -1) + 1;

  const { rows } = await sql<CardRow>`
    INSERT INTO cards (level, question, position, user_id)
    VALUES (${level}, ${question}, ${nextPosition}, ${userId})
    RETURNING id, level, question, position, user_id, answered_at, times_completed;
  `;
  return mapCardRow(rows[0]);
}

/**
 * Sets (never toggles) whether a card is answered. Always takes an explicit target
 * value from the caller rather than flipping whatever's currently stored — with two
 * people sharing this deck from separate logins, a toggle could race (both see
 * "unanswered", both flip, second flip cancels the first). Setting an explicit value
 * is idempotent: both requests land on the same end state no matter which arrives last.
 */
export async function setCardAnswered(
  id: number,
  answered: boolean,
): Promise<void> {
  await sql`
    UPDATE cards SET answered_at = ${answered ? new Date().toISOString() : null}
    WHERE id = ${id};
  `;
}

/** Increments a dare's completion counter. Scoped to level='dare' — dares never get
 * answered_at set, so this is the only signal for how many times one's been done. */
export async function incrementDareCompleted(id: number): Promise<void> {
  await sql`
    UPDATE cards SET times_completed = times_completed + 1
    WHERE id = ${id} AND level = 'dare';
  `;
}

/**
 * Puts an answered truth back into the draw pool, enforcing ownership for non-admins.
 * Unlike setCardAnswered (shared gameplay state, no ownership check), this is a personal
 * management action — a user should only be able to reactivate their own cards.
 * Returns whether a row was changed.
 */
export async function reactivateCard(
  id: number,
  requester: Session,
): Promise<boolean> {
  const isAdmin = requester.role === "admin";
  const { rowCount } = await sql`
    UPDATE cards SET answered_at = NULL
    WHERE id = ${id} AND (${isAdmin} OR user_id = ${requester.userId});
  `;
  return (rowCount ?? 0) > 0;
}

/** Updates a card's level/question, enforcing ownership for non-admins. Returns whether a row was changed. */
export async function updateCard(
  id: number,
  level: Level,
  question: string,
  requester: Session,
): Promise<boolean> {
  const isAdmin = requester.role === "admin";
  const { rowCount } = await sql`
    UPDATE cards SET level = ${level}, question = ${question}
    WHERE id = ${id} AND (${isAdmin} OR user_id = ${requester.userId});
  `;
  return (rowCount ?? 0) > 0;
}

/** Deletes a card, enforcing ownership for non-admins. Returns whether a row was removed. */
export async function deleteCard(
  id: number,
  requester: Session,
): Promise<boolean> {
  const isAdmin = requester.role === "admin";
  const { rowCount } = await sql`
    DELETE FROM cards WHERE id = ${id} AND (${isAdmin} OR user_id = ${requester.userId});
  `;
  return (rowCount ?? 0) > 0;
}

export interface DbAiCard {
  id: number;
  level: Level;
  question: string;
  model: string;
  createdAt: Date;
  answeredAt: Date | null;
  timesCompleted: number;
}

interface AiCardRow {
  id: number;
  level: Level;
  question: string;
  model: string;
  created_at: string | Date;
  answered_at: RawTimestamp;
  times_completed: number;
}

function mapAiCardRow(row: AiCardRow): DbAiCard {
  return {
    id: row.id,
    level: row.level,
    question: row.question,
    model: row.model,
    createdAt: new Date(row.created_at),
    answeredAt: row.answered_at ? new Date(row.answered_at) : null,
    timesCompleted: row.times_completed,
  };
}

/** All AI-generated cards, most recent first — used by the Manage screen's "IA" tab. */
export async function getAiCards(): Promise<DbAiCard[]> {
  const { rows } = await sql<AiCardRow>`
    SELECT id, level, question, model, created_at, answered_at, times_completed
    FROM ai_cards
    ORDER BY created_at DESC;
  `;
  return rows.map((row) => mapAiCardRow(row));
}

/** Most recent ai_cards.created_at, or null if none exist yet — used to rate-limit
 * generation (see src/lib/ai/rateLimit.ts). */
export async function getLastAiCardCreatedAt(): Promise<Date | null> {
  const { rows } = await sql<{ created_at: RawTimestamp }>`
    SELECT created_at FROM ai_cards ORDER BY created_at DESC LIMIT 1;
  `;
  const row = rows[0];
  return row?.created_at ? new Date(row.created_at) : null;
}

export async function createAiCard(
  level: Level,
  question: string,
  model: string,
): Promise<DbAiCard> {
  const { rows } = await sql<AiCardRow>`
    INSERT INTO ai_cards (level, question, model)
    VALUES (${level}, ${question}, ${model})
    RETURNING id, level, question, model, created_at, answered_at, times_completed;
  `;
  return mapAiCardRow(rows[0]);
}

/** Mirrors setCardAnswered — same explicit-value, no-toggle reasoning applies. */
export async function setAiCardAnswered(
  id: number,
  answered: boolean,
): Promise<void> {
  await sql`
    UPDATE ai_cards SET answered_at = ${answered ? new Date().toISOString() : null}
    WHERE id = ${id};
  `;
}

/** Mirrors incrementDareCompleted. */
export async function incrementAiDareCompleted(id: number): Promise<void> {
  await sql`
    UPDATE ai_cards SET times_completed = times_completed + 1
    WHERE id = ${id} AND level = 'dare';
  `;
}

/** The compact, LLM-maintained summary of topics already covered — '' until the first refresh. */
export async function getAiContextSummary(): Promise<string> {
  const { rows } = await sql<{ summary: string }>`
    SELECT summary FROM ai_context WHERE id = 1;
  `;
  return rows[0]?.summary ?? "";
}

export async function upsertAiContextSummary(summary: string): Promise<void> {
  await sql`
    INSERT INTO ai_context (id, summary, updated_at)
    VALUES (1, ${summary}, now())
    ON CONFLICT (id) DO UPDATE SET summary = EXCLUDED.summary, updated_at = EXCLUDED.updated_at;
  `;
}

/** Just the text of every already-answered question, across both tables — used to
 * build the AI prompt context without pulling every column of every card over the wire
 * (a plain SELECT of one column, not the full getAllCards()/getAiCards() shape). */
export async function getAnsweredQuestions(): Promise<string[]> {
  const { rows } = await sql<{ question: string }>`
    SELECT question FROM cards WHERE answered_at IS NOT NULL
    UNION ALL
    SELECT question FROM ai_cards WHERE answered_at IS NOT NULL;
  `;
  return rows.map((r) => r.question);
}

/** How many ai_cards were created after the context summary was last refreshed. */
export async function countAiCardsSinceContextUpdate(): Promise<number> {
  const { rows } = await sql<{ count: number }>`
    SELECT COUNT(*)::int AS count FROM ai_cards
    WHERE created_at > COALESCE((SELECT updated_at FROM ai_context WHERE id = 1), '-infinity');
  `;
  return rows[0]?.count ?? 0;
}

/**
 * The full draw pool for the game screen: manual cards plus AI-generated ones, merged
 * into the lightweight `Card` shape GameRound already works with. AI card ids are
 * prefixed `ai-<id>` so callers (the answered/complete API routes) can tell which table
 * an id belongs to without either table knowing the other exists — see parseCardRef in
 * src/lib/id.ts. This is the only place in the app that queries both tables at once.
 */
export async function getGameCards(): Promise<Card[]> {
  const [manual, ai] = await Promise.all([getAllCards(), getAiCards()]);
  const toCard = (
    id: string,
    c: { level: Level; question: string; answeredAt: Date | null },
  ): Card => ({
    id,
    level: c.level,
    question: c.question,
    answered: c.answeredAt !== null,
  });

  return [
    ...manual.map((c) => toCard(String(c.id), c)),
    ...ai.map((c) => toCard(`ai-${c.id}`, c)),
  ];
}

/** Routes "mark answered" to the right table for a card id of either source — the one
 * place outside getGameCards that needs to know both tables exist. */
export async function setCardAnsweredByRef(
  ref: CardRef,
  answered: boolean,
): Promise<void> {
  await (ref.source === "ai"
    ? setAiCardAnswered(ref.id, answered)
    : setCardAnswered(ref.id, answered));
}

/** Routes "increment dare completion" to the right table for a card id of either source. */
export async function incrementCardCompletedByRef(ref: CardRef): Promise<void> {
  await (ref.source === "ai"
    ? incrementAiDareCompleted(ref.id)
    : incrementDareCompleted(ref.id));
}

/**
 * One random unanswered manual truth, if any exists — used by the game's AI fallback
 * flow to cheaply check "did the real deck pick up a new question?" (e.g. a partner
 * added one mid-session) without pulling the whole pool over the wire for a single
 * skip/confirm click.
 */
export async function getRandomUnansweredManualTruth(): Promise<Card | null> {
  const { rows } = await sql<{ id: number; level: Level; question: string }>`
    SELECT id, level, question FROM cards
    WHERE level != 'dare' AND answered_at IS NULL
    ORDER BY random()
    LIMIT 1;
  `;
  const row = rows[0];
  return row
    ? {
        id: String(row.id),
        level: row.level,
        question: row.question,
        answered: false,
      }
    : null;
}

export async function getCountdown(): Promise<Countdown | null> {
  const { rows } = await sql<{
    target_at: string;
    time_zone: string;
    location: string | null;
    label: string;
  }>`
    SELECT target_at, time_zone, location, label FROM countdown WHERE id = 1;
  `;
  const row = rows[0];
  return row
    ? {
        targetAt: new Date(row.target_at),
        timeZone: row.time_zone,
        location: row.location,
        label: row.label,
      }
    : null;
}

export async function setCountdown(
  targetAt: Date,
  timeZone: string,
  location: string | null,
  label: string,
): Promise<void> {
  await sql`
    INSERT INTO countdown (id, target_at, time_zone, location, label)
    VALUES (1, ${targetAt.toISOString()}, ${timeZone}, ${location}, ${label})
    ON CONFLICT (id) DO UPDATE SET
      target_at = EXCLUDED.target_at,
      time_zone = EXCLUDED.time_zone,
      location = EXCLUDED.location,
      label = EXCLUDED.label;
  `;
}
