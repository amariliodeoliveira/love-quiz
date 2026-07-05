import { redirect } from "next/navigation";
import { getCardsForUser } from "@/lib/db";
import { getSession } from "@/lib/auth";
import ProfileDashboard from "./_components/ProfileDashboard";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/profile/login");
  }

  const cards = await getCardsForUser(session);
  return <ProfileDashboard initialCards={cards} session={session} />;
}
