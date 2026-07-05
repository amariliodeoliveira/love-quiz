import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import UserAvatarMenu from "./_components/UserAvatarMenu";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;

  return (
    <>
      <header className="profile-header">
        <Link href="/" className="profile-back-link">
          ← Back to game
        </Link>
        {user && (
          <UserAvatarMenu username={user.username} avatarColor={user.avatarColor} />
        )}
      </header>
      <main className="profile-main">{children}</main>
      <footer>
        <p>Couples Card Deck</p>
      </footer>
    </>
  );
}
