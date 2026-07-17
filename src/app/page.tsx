import Link from "next/link";
import { LOGIN_PATH } from "@/lib/routes";

export default function Home() {
  return (
    <>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="px-6 pt-18 pb-14 text-center">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Interactive Game
          </p>
          <h1 className="mb-4 font-serif text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.1] font-normal text-text">
            Couples
            <br />
            <em className="italic text-subtext">Card Deck</em>
          </h1>
          <p className="mx-auto mb-9 max-w-[400px] text-[0.95rem] leading-[1.6] text-subtext">
            A little game for the two of you. Sign in to open your deck and
            start flipping cards together.
          </p>
          <Link href={LOGIN_PATH} className="btn">
            Sign in
          </Link>
        </div>
      </div>
      <footer className="border-t border-border">
        <p>© {new Date().getFullYear()} Couples Card Deck</p>
      </footer>
    </>
  );
}
