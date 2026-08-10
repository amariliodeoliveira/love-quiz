import GameRound from "../../_components/game/GameRound";
import DeckFooter from "../../_components/deck/DeckFooter";
import { getGameCards } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function GamePage() {
  const cards = await getGameCards();

  const dareCount = cards.filter((c) => c.level === "dare").length;
  const questionCount = cards.length - dareCount;

  return (
    <>
      <GameRound cards={cards} />
      <DeckFooter questionCount={questionCount} dareCount={dareCount} />
    </>
  );
}
