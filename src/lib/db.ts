import { sql } from "@vercel/postgres";
import type { Level } from "@/data/cards";

export interface DbCard {
  id: number;
  level: Level;
  question: string;
  position: number;
}

export async function getAllCards(): Promise<DbCard[]> {
  const { rows } = await sql<DbCard>`
    SELECT id, level, question, position
    FROM cards
    ORDER BY level, position;
  `;
  return rows;
}

export async function createCard(
  level: Level,
  question: string,
): Promise<DbCard> {
  const { rows: maxRows } = await sql<{ max: number | null }>`
    SELECT MAX(position) AS max FROM cards WHERE level = ${level};
  `;
  const nextPosition = (maxRows[0].max ?? -1) + 1;

  const { rows } = await sql<DbCard>`
    INSERT INTO cards (level, question, position)
    VALUES (${level}, ${question}, ${nextPosition})
    RETURNING id, level, question, position;
  `;
  return rows[0];
}

export async function deleteCard(id: number): Promise<void> {
  await sql`DELETE FROM cards WHERE id = ${id};`;
}
