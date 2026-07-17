import { sql } from "@vercel/postgres";
import type { Level } from "@/data/cards";
import type { AvatarColorName } from "@/lib/avatar";

export type Role = "admin" | "user";

export interface DbUser {
  id: number;
  username: string;
  passwordHash: string | null;
  role: Role;
  avatarColor: string;
  failedAttempts: number;
  lockedUntil: Date | null;
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
}

interface CardRow {
  id: number;
  level: Level;
  question: string;
  position: number;
  user_id: number | null;
  answered_at: string | Date | null;
}

function mapCardRow(row: CardRow): DbCard {
  return {
    id: row.id,
    level: row.level,
    question: row.question,
    position: row.position,
    userId: row.user_id,
    answeredAt: row.answered_at ? new Date(row.answered_at) : null,
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
}

interface UserRow {
  id: number;
  username: string;
  password_hash: string | null;
  role: Role;
  avatar_color: string;
  failed_attempts: number;
  locked_until: string | Date | null;
}

function mapUserRow(row: UserRow): DbUser {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    avatarColor: row.avatar_color,
    failedAttempts: row.failed_attempts,
    lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
  };
}

export async function findUserByUsername(
  username: string,
): Promise<DbUser | null> {
  const { rows } = await sql<UserRow>`
    SELECT id, username, password_hash, role, avatar_color, failed_attempts, locked_until
    FROM users
    WHERE username = ${username};
  `;
  const row = rows[0];
  return row ? mapUserRow(row) : null;
}

export async function getUserById(id: number): Promise<DbUser | null> {
  const { rows } = await sql<UserRow>`
    SELECT id, username, password_hash, role, avatar_color, failed_attempts, locked_until
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

export async function updateAvatarColor(
  userId: number,
  color: AvatarColorName,
): Promise<void> {
  await sql`
    UPDATE users SET avatar_color = ${color} WHERE id = ${userId};
  `;
}

export async function getAllCards(): Promise<DbCard[]> {
  const { rows } = await sql<CardRow>`
    SELECT id, level, question, position, user_id, answered_at
    FROM cards
    ORDER BY level, position;
  `;
  return rows.map(mapCardRow);
}

export async function getCardsForUser(session: Session): Promise<DbCard[]> {
  if (session.role === "admin") {
    return getAllCards();
  }
  const { rows } = await sql<CardRow>`
    SELECT id, level, question, position, user_id, answered_at
    FROM cards
    WHERE user_id = ${session.userId}
    ORDER BY level, position;
  `;
  return rows.map(mapCardRow);
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
    RETURNING id, level, question, position, user_id, answered_at;
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
export async function setCardAnswered(id: number, answered: boolean): Promise<void> {
  await sql`
    UPDATE cards SET answered_at = ${answered ? new Date().toISOString() : null}
    WHERE id = ${id};
  `;
}

/** Clears answered_at for every card — lets the deck be replayed from scratch. */
export async function resetAllAnswered(): Promise<void> {
  await sql`UPDATE cards SET answered_at = NULL;`;
}

/** Updates a card's level/question, enforcing ownership for non-admins. Returns whether a row was changed. */
export async function updateCard(
  id: number,
  level: Level,
  question: string,
  requester: Session,
): Promise<boolean> {
  if (requester.role === "admin") {
    const { rowCount } = await sql`
      UPDATE cards SET level = ${level}, question = ${question} WHERE id = ${id};
    `;
    return (rowCount ?? 0) > 0;
  }
  const { rowCount } = await sql`
    UPDATE cards SET level = ${level}, question = ${question}
    WHERE id = ${id} AND user_id = ${requester.userId};
  `;
  return (rowCount ?? 0) > 0;
}

/** Deletes a card, enforcing ownership for non-admins. Returns whether a row was removed. */
export async function deleteCard(
  id: number,
  requester: Session,
): Promise<boolean> {
  if (requester.role === "admin") {
    const { rowCount } = await sql`DELETE FROM cards WHERE id = ${id};`;
    return (rowCount ?? 0) > 0;
  }
  const { rowCount } = await sql`
    DELETE FROM cards WHERE id = ${id} AND user_id = ${requester.userId};
  `;
  return (rowCount ?? 0) > 0;
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
