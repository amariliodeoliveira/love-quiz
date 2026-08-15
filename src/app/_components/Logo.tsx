import Link from "next/link";

import { HOME_PATH } from "@/lib/routes";

/** Clickable wordmark for the header's top-left slot — the "back to home" affordance
 * every site has. Kept as plain text (no icon asset) to match the serif brand type used
 * on the landing page's <h1>. */
export default function Logo() {
  return (
    <Link
      href={HOME_PATH}
      className="text-text hover:text-subtext font-serif text-sm no-underline"
    >
      Couples Card Deck
    </Link>
  );
}
