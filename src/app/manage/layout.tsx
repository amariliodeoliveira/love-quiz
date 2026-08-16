import { getAppHeaderData } from "@/lib/appHeaderData";
import { GAME_PATH } from "@/lib/routes";

import AppHeader from "../_components/AppHeader";
import SiteFooter from "../_components/SiteFooter";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, countdown } = await getAppHeaderData();

  return (
    <>
      <AppHeader
        backHref={user ? GAME_PATH : undefined}
        backLabel={user ? "← Back to game" : undefined}
        showCountdownBubble={false}
        user={user}
        countdown={countdown}
      />
      <main className="profile-main">{children}</main>
      <SiteFooter />
    </>
  );
}
