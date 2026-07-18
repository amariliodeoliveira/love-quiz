import Link from "next/link";
import { GAME_ROUND_PATH } from "@/lib/routes";

export default function TruthOrDareLanding() {
  return (
    <div className="px-6 pt-18 pb-14 text-center">
      <p className="mb-5 text-xs font-medium tracking-[0.18em] text-muted uppercase">
        Interactive Game
      </p>
      <h1 className="mb-4 font-serif text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.1] font-normal text-text">
        Couples
        <br />
        <em className="text-subtext italic">Card Deck</em>
      </h1>
      <p className="mx-auto mb-9 max-w-[400px] text-[0.95rem] leading-[1.6] text-subtext">
        On a call together? Draw a card and read it out loud.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={GAME_ROUND_PATH} className="btn">
          Play 🚀
        </Link>
        <button type="button" className="btn-ghost" disabled>
          View Rules 📖
        </button>
      </div>
    </div>
  );
}
