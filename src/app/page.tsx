import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { GAME_PATH, LOGIN_PATH } from "@/lib/routes";

import GameWordmark from "./_components/GameWordmark";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(GAME_PATH);
  }

  return (
    <>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="px-6 pt-18 pb-14 text-center">
          <p className="text-muted mb-5 text-xs font-medium tracking-[0.18em] uppercase">
            Interactive Game
          </p>
          <GameWordmark />
          <p className="leading-1.6 text-subtext mx-auto mb-9 max-w-100 text-[0.95rem]">
            A little game for the two of you. Sign in to open your deck and
            start flipping cards together.
          </p>
          <Link href={LOGIN_PATH} className="btn">
            Sign in
          </Link>
        </div>
      </div>
      <footer>
        <p>© {new Date().getFullYear()} Couples Card Deck</p>
      </footer>
    </>
  );
}
