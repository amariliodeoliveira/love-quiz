import { getAppHeaderData } from "@/lib/appHeaderData";

import AppHeader from "../../_components/AppHeader";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, countdown } = await getAppHeaderData();

  return (
    <>
      <AppHeader user={user} countdown={countdown} />
      <div className="profile-main">{children}</div>
    </>
  );
}
