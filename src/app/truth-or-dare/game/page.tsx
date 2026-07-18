import GameRound from "../../_components/game/GameRound";
import { getAllCards } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function GamePage() {
  const dbCards = await getAllCards();
  const cards = dbCards.map((c) => ({
    id: String(c.id),
    level: c.level,
    question: c.question,
    answered: c.answeredAt !== null,
  }));

  return <GameRound cards={cards} />;
}
