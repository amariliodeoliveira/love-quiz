import { redirect } from "next/navigation";
import { getCardsForUser } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { LOGIN_PATH } from "@/lib/routes";
import ManageDashboard from "./_components/ManageDashboard";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const session = await getSession();
  if (!session) {
    redirect(LOGIN_PATH);
  }

  const cards = await getCardsForUser(session);
  return <ManageDashboard initialCards={cards} session={session} />;
}
