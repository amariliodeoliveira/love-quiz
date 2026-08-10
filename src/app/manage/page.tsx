import { redirect } from "next/navigation";
import { getAiCards, getCardsForUser } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { LOGIN_PATH } from "@/lib/routes";
import ManageDashboard from "./_components/ManageDashboard";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const session = await getSession();
  if (!session) {
    redirect(LOGIN_PATH);
  }

  const [cards, aiCards] = await Promise.all([getCardsForUser(session), getAiCards()]);
  return <ManageDashboard initialCards={cards} initialAiCards={aiCards} session={session} />;
}
