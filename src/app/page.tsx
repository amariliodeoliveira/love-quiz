import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { GAME_PATH, LOGIN_PATH } from "@/lib/routes";

import LandingHero from "./_components/LandingHero";
import SiteFooter from "./_components/SiteFooter";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(GAME_PATH);
  }

  return (
    <>
      <div className="flex flex-1 items-center justify-center p-6">
        <LandingHero description="A little game for the two of you. Sign in to open your deck and start flipping cards together.">
          <Link href={LOGIN_PATH} className="btn">
            Sign in
          </Link>
        </LandingHero>
      </div>
      <SiteFooter />
    </>
  );
}
