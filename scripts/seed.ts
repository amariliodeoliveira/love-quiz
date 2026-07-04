import { sql } from "@vercel/postgres";
import { cards } from "../src/data/cards";

async function main() {
  console.log("Criando tabela...");
  await sql`
    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      level TEXT NOT NULL,
      question TEXT NOT NULL,
      position INTEGER NOT NULL
    );
  `;

  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM cards;`;
  if (rows[0].count > 0) {
    console.log(
      `Tabela já tem ${rows[0].count} cards. Nada foi inserido de novo.`,
    );
    return;
  }

  console.log(`Inserindo ${cards.length} cards...`);
  let position = 0;
  for (const card of cards) {
    await sql`
      INSERT INTO cards (level, question, position)
      VALUES (${card.level}, ${card.question}, ${position});
    `;
    position++;
  }

  console.log("Pronto!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
