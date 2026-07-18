import GameRound from "../../_components/game/GameRound";
import DeckFooter from "../../_components/deck/DeckFooter";
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

  const dareCount = cards.filter((c) => c.level === "dare").length;
  const questionCount = cards.length - dareCount;

  return (
    <>
      <GameRound cards={cards} />
      <DeckFooter questionCount={questionCount} dareCount={dareCount} />
    </>
  );
}
