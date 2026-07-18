import { getAppHeaderData } from "@/lib/appHeaderData";
import { GAME_PATH } from "@/lib/routes";
import AppHeader from "../_components/AppHeader";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, countdown } = await getAppHeaderData();

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
