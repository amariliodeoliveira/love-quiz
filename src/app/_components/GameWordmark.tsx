/**
 * The large "Couples / Card Deck" heading shared by the home page and the
 * /truth-or-dare landing — kept as one component so a spacing/copy fix only needs to
 * happen once (see docs/lint-plugins-report.md for why the arbitrary leading value is
 * required here).
 */
export default function GameWordmark() {
  return (
    // A bare `leading-<value>` here doesn't actually generate the utility in this
    // Tailwind v4 setup (computed line-height silently falls back to the 1.5 default) —
    // the bracketed arbitrary-value form below is required.
    // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
    <h1 className="text-text mb-4 font-serif text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.05] font-normal">
      Couples
      <br />
      <em className="text-subtext italic">Card Deck</em>
    </h1>
  );
}
