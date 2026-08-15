import { getAppHeaderData } from "@/lib/appHeaderData";
import { GAME_PATH } from "@/lib/routes";

import AppHeader from "../../_components/AppHeader";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, countdown } = await getAppHeaderData();

  return (
    <>
      <AppHeader
        variant="game"
        backHref={GAME_PATH}
        backLabel="➔ Exit Game"
        user={user}
        countdown={countdown}
      />
      <div className="profile-main">{children}</div>
    </>
  );
}
