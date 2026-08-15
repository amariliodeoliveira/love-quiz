import Link from "next/link";

import { GAME_ROUND_PATH } from "@/lib/routes";

import LandingHero from "../LandingHero";

export default function TruthOrDareLanding() {
  return (
    <LandingHero description="On a call together? Draw a card and read it out loud.">
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={GAME_ROUND_PATH} className="btn">
          🚀 Play
        </Link>
        <button type="button" className="btn-ghost" disabled>
          📖 View rules
        </button>
      </div>
    </LandingHero>
  );
}
