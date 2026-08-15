import Link from "next/link";

import { HOME_PATH } from "@/lib/routes";

/** Clickable wordmark for the header's top-left slot — the "back to home" affordance
 * every site has. Mirrors GameWordmark's two-line style (see GameWordmark.tsx) at header
 * scale: same font, same italic second line, same tight leading, just much smaller. */
export default function Logo() {
  return (
    <Link
      href={HOME_PATH}
      // A bare `leading-<value>` doesn't actually generate the utility in this Tailwind
      // v4 setup (see GameWordmark.tsx / docs/lint-plugins-report.md) — the bracketed
      // arbitrary-value form is required.
      // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
      className="text-center font-serif text-base leading-[1.05] no-underline hover:opacity-80"
    >
      <span className="text-text block">Couples</span>
      <span className="text-subtext block italic">Card Deck</span>
    </Link>
  );
}
