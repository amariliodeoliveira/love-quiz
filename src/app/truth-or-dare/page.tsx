import AppHeader from "../_components/AppHeader";
import TruthOrDareLanding from "../_components/deck/TruthOrDareLanding";
import DeckFooter from "../_components/deck/DeckFooter";
import { getAppHeaderData } from "@/lib/appHeaderData";
import { getAllCards } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TruthOrDarePage() {
  const { user, countdown } = await getAppHeaderData();
  const cards = await getAllCards();

  const dareCount = cards.filter((c) => c.level === "dare").length;
  const questionCount = cards.length - dareCount;

  return (
    <>
      <AppHeader user={user} countdown={countdown} />
      <div className="profile-main">
        <div className="flex flex-1 flex-col justify-center">
          <TruthOrDareLanding />
        </div>
        <DeckFooter questionCount={questionCount} dareCount={dareCount} />
      </div>
    </>
  );
}
