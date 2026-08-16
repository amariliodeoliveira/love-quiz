# Design Guidelines

Apply these rules to every screen.

## Layout

When a `max-width` container is a flex item, pair `margin: 0 auto` with `width: 100%`. Auto cross-axis margins otherwise disable stretch and can make the element shrink to its content.

## Spacing

- Use the 4px Tailwind spacing scale; use multiples of 8px between distinct groups. Reserve 4px sub-units for deliberately tight relationships such as icon-to-label gaps.
- Prefer proximity: related elements sit closer together than unrelated ones.
- Keep internal padding less than or equal to the external gap between sibling components.
- Do not introduce arbitrary pixel values when a scale step works.
- When touching a layout, bring that local component into line with the rules; do not turn a feature change into an unrelated visual sweep.
- Verify visual changes in a browser or screenshot, not only by reading class names.

Keep `leading-[1.05]` bracketed: Tailwind v4 can fail to generate some bare decimal `leading-<value>` utilities. The incident is documented in [`docs/lint-plugins-report.md`](../../docs/lint-plugins-report.md).

## Typography

- Never use Light or Thin weights for UI text; `400` is the baseline and buttons or tabs explicitly use `500`.
- Keep interactive text at least 14px. Use 12px only for genuinely secondary, non-interactive text; never go below it.
- Give every button-like element an explicit font weight.
- Use roughly 1.4–1.6× line height for body copy; tighter leading is acceptable for large display headings.

## Copy and UX writing

- Use specific, verb-led labels such as `Save changes`, `Create countdown`, and `Generate question` rather than generic `Save` or `Submit`.
- Keep product copy in English and use one consistent tone.
- Use leading emoji consistently across comparable labels; do not decorate a single sibling arbitrarily.
- Match the existing error shape: `Couldn't <specific thing> — check your connection and try again.`
- Use sentence case for buttons and links except deliberate proper nouns or game terms.
