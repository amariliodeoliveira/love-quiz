import CardDeck from "../_components/CardDeck";
import { getAllCards } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TruthOrDarePage() {
  const dbCards = await getAllCards();
  const cards = dbCards.map((c) => ({
    id: String(c.id),
    level: c.level,
    question: c.question,
    answered: c.answeredAt !== null,
  }));

  return <CardDeck cards={cards} />;
}
