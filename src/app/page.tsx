import Link from "next/link";

import { LOGIN_PATH } from "@/lib/routes";

export default function Home() {
  return (
    <>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="px-6 pt-18 pb-14 text-center">
          <p className="text-muted mb-5 text-xs font-medium tracking-[0.18em] uppercase">
            Interactive Game
          </p>
          <h1 className="leading-1.1 text-text mb-4 font-serif text-[clamp(2.2rem,6vw,3.8rem)] font-normal">
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
