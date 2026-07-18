import AppHeader from "../_components/AppHeader";
import TruthOrDareLanding from "../_components/deck/TruthOrDareLanding";
import DeckFooter from "../_components/deck/DeckFooter";
import { getSession } from "@/lib/auth";
import { getUserById, getAllCards, getCountdown } from "@/lib/db";
import { toCountdownDisplay } from "@/lib/countdown";

export const dynamic = "force-dynamic";

export default async function TruthOrDarePage() {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;
  const countdown = toCountdownDisplay(await getCountdown());
  const cards = await getAllCards();

  const dareCount = cards.filter((c) => c.level === "dare").length;
  const questionCount = cards.length - dareCount;

  return (
    <>
      <AppHeader user={user} countdown={countdown} />
      <div className="profile-main">
        <TruthOrDareLanding />
        <DeckFooter questionCount={questionCount} dareCount={dareCount} />
      </div>
    </>
  );
}
