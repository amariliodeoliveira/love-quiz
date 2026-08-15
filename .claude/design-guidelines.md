# Design Guidelines

Researched and adopted 2026-08-15 (see `docs/lint-plugins-report.md`'s neighbor —
this file, not that one — for the actual rules; that one is about lint tooling).
Applies to every screen, not just the ones it was first applied to.

## Spacing

### The scale

This project's spacing scale lives in `src/app/globals.css` as `--space-1` through
`--space-20` (4px base unit, 8pt-grid-aligned: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56,
72, 80). In JSX, use the matching bare Tailwind utility (`p-4`, `gap-6`, `mb-8`, ...) —
Tailwind's default scale is the same 4px unit, so `mb-8` = `32px` = `--space-8`.

**Stick to multiples of 8** for anything that separates distinct sections or groups
(headings, cards, form fields, page sections). A 4px sub-unit (`gap-1`, `mt-1`,
`py-0.5`) is fine for genuinely tight spots — icon-to-label gaps, badge padding — but
reach for it deliberately, not by default. Never hand-write an arbitrary pixel value
(`p-[13px]`) when a scale step is close enough; if a value doesn't fit the scale at
all, that's usually a sign the layout needs rethinking, not a new one-off token.

### Three rules, in priority order

1. **Proximity**: elements that belong together sit closer than elements that don't.
   Concretely, going down a page, each gap should be **greater than or equal to** the
   gap before it, never smaller — a heading sits closer to the text it introduces than
   that text sits to the next unrelated section/action. (`eyebrow → heading: 24px`,
   `heading → body: 16px` gets this backwards on purpose — the heading+eyebrow are one
   tight unit — see `LandingHero.tsx`'s comment for the worked example.) When in doubt:
   would a user visually group these two things? If yes, shrink the gap; if no, grow it.
2. **Internal ≤ external**: a component's own padding should be less than or equal to
   the margin/gap between it and its siblings. A card with 20px internal padding wants
   at least 20px between it and the next card — otherwise cards visually merge into
   each other instead of reading as separate items.
3. **8pt grid**: see above. Consistency here is what makes spacing feel deliberate
   instead of accidental, even when the difference is only a few pixels.

### Applying spacing

- New UI: pick spacing from the scale, then sanity-check it against the three rules
  above before shipping.
- Touching existing UI: if you're already editing a component's layout, bring its
  spacing in line with this doc while you're in there — don't leave it half-migrated.
  Don't go out of your way to audit unrelated screens in the same change, though;
  that's a separate pass, not a drive-by.
- Verify visually (see `run` skill / take a screenshot), not just by reading the
  className — line-height and font-size interact with margins in ways that are hard to
  eyeball from source alone.

### Known false positive (Tailwind leading utility)

`eslint-plugin-tailwindcss`'s `no-unnecessary-arbitrary-value` will suggest turning
`leading-[1.05]` into a bare `leading-1.05`. **Don't take that fix** — verified
empirically (computed `line-height` via headless-browser check) that certain bare
decimal `leading-<value>` utilities silently fail to generate in this project's
Tailwind v4 setup and fall back to the `1.5` default. Keep the bracketed form and
suppress the rule on that line with a comment pointing here. Full incident log in
`docs/lint-plugins-report.md`.

## Copy / UX writing

Researched and adopted 2026-08-15.

### Rules

1. **Specific, verb-led labels.** Avoid vague CTAs (`Save`, `Submit`, `OK`, `Generate`)
   when a concrete one fits — `Save changes`, `Create countdown`, `Generate question`.
   The label should say what happens, not just gesture at a generic action.
2. **One tone, one language, everywhere.** English throughout (this bit us once: a tab
   was labeled "IA" — the Portuguese acronym — while every other AI-related label said
   "AI"). Don't let a stray word revert to whatever language you were thinking in.
3. **Consistent decoration.** If some labels get a leading emoji (`🚀 Play`), all
   comparable labels should follow the same placement — prefix, not suffix, not mixed.
   Don't decorate one button in a group and leave its sibling plain without a reason.
4. **Consistent error-message shape.** This app's pattern is
   `"Couldn't <specific thing> — check your connection and try again."` — match it
   rather than improvising a shorter/different variant for a new error.
5. **Sentence case for button/link text** (`View rules`, not `View Rules`), except for
   proper nouns/game terms this project deliberately capitalizes (`Truth`, `Dare`).

### Applying this

Same rule as spacing: fix the copy you're already touching, don't go audit unrelated
screens as a drive-by. A full sweep (like the one that produced this section) is its
own deliberate pass, done when asked for one.
