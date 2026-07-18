import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { GAME_PATH } from "@/lib/routes";
import AppHeader from "../../_components/AppHeader";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;

  return (
    <>
      <AppHeader
        variant="game"
        backHref={GAME_PATH}
        backLabel="➔ Exit Game"
        user={user}
        countdown={null}
      />
      <div className="profile-main">{children}</div>
    </>
  );
}
