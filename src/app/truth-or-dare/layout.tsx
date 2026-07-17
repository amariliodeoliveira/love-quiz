import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { PROFILE_PATH } from "@/lib/routes";
import AppHeader from "../_components/AppHeader";

export default async function TruthOrDareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;

  return (
    <>
      <AppHeader backHref={PROFILE_PATH} backLabel="Manage cards" user={user} />
      <div className="profile-main">{children}</div>
    </>
  );
}
