import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { GAME_PATH } from "@/lib/routes";
import AppHeader from "../_components/AppHeader";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;

  return (
    <>
      <AppHeader backHref={GAME_PATH} backLabel="← Back to game" user={user} />
      <main className="profile-main">{children}</main>
      <footer>
        <p>Couples Card Deck</p>
      </footer>
    </>
  );
}
