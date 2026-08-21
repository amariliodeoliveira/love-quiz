import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { GAME_ROUND_PATH, GAME_RULES_PATH } from "@/lib/routes";

import LandingHero from "../LandingHero";

export default async function TruthOrDareLanding() {
  const t = await getTranslations("Game");

  return (
    <LandingHero description={t("landing.description")}>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={GAME_ROUND_PATH} className="btn">
          {t("landing.play")}
        </Link>
        <Link href={GAME_RULES_PATH} className="btn-ghost">
          {t("landing.viewRules")}
        </Link>
      </div>
    </LandingHero>
  );
}
