import { getSession } from "@/lib/auth";
import { getUserById, getCountdown } from "@/lib/db";
import { toCountdownDisplay } from "@/lib/countdown";
import { PROFILE_PATH } from "@/lib/routes";
import AppHeader from "../_components/AppHeader";

export default async function TruthOrDareLayout({
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
        backHref={PROFILE_PATH}
        backLabel="Manage cards"
        user={user}
        countdown={countdown}
      />
      <div className="profile-main">{children}</div>
    </>
  );
}
