import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { GAME_PATH, LOGIN_PATH } from "@/lib/routes";

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
          {/* The suggested bare `leading-0.95` doesn't actually generate the utility in
           this Tailwind v4 setup (computed line-height silently falls back to the 1.5
           default) — verified empirically, see docs/lint-plugins-report.md. */}
          {/* eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value */}
          <h1 className="text-text mb-4 font-serif text-[clamp(2.2rem,6vw,3.8rem)] leading-[0.95] font-normal">
            Couples
            <br />
            <em className="text-subtext italic">Card Deck</em>
          </h1>
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
