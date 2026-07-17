import Link from "next/link";
import type { DbUser } from "@/lib/db";
import UserAvatarMenu from "./UserAvatarMenu";

export default function AppHeader({
  backHref,
  backLabel,
  user,
}: {
  backHref: string;
  backLabel: string;
  user: Pick<DbUser, "username" | "avatarColor"> | null;
}) {
  return (
    <header className="profile-header">
      <Link href={backHref} className="profile-back-link">
        {backLabel}
      </Link>
      {user && (
        <UserAvatarMenu username={user.username} avatarColor={user.avatarColor} />
      )}
    </header>
  );
}
