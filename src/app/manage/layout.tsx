import { getSession } from "@/lib/auth";
import { getUserById, getCountdown } from "@/lib/db";
import { toCountdownDisplay } from "@/lib/countdown";
import { GAME_PATH } from "@/lib/routes";
import AppHeader from "../_components/AppHeader";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;
  const countdown = toCountdownDisplay(await getCountdown());

  return (
    <>
      <AppHeader
        backHref={GAME_PATH}
        backLabel="← Back to game"
        user={user}
        countdown={countdown}
      />
      <main className="profile-main">{children}</main>
      <footer>
        <p>Couples Card Deck</p>
      </footer>
    </>
  );
}
