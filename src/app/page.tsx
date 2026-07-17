import Link from "next/link";
import { LOGIN_PATH } from "@/lib/routes";

export default function Home() {
  return (
    <div className="center-screen">
      <div className="hero">
        <p className="hero-eyebrow">Interactive Game</p>
        <h1>
          Couples
          <br />
          <em>Card Deck</em>
        </h1>
        <p>
          A little game for the two of you. Sign in to open your deck and
          start flipping cards together.
        </p>
        <Link href={LOGIN_PATH} className="btn">
          Sign in
        </Link>
      </div>
    </div>
  );
}
