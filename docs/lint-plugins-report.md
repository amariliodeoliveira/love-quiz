# Lint/format plugin evaluation

This repo doubles as an experiment ground for AI-driven tooling choices. This file is the running
record for the ESLint/Prettier plugins wired up in [`eslint.config.mjs`](../eslint.config.mjs) and
[`.prettierrc.json`](../.prettierrc.json): why each one was picked, how they behave together, and a
log entry every time one of them actually does something — catches a real issue, throws a false
positive, or breaks something via autofix. New entries get appended at the bottom of the log as they
happen; the verdicts above get updated if a plugin's track record changes.

## Plugins and verdicts

| Plugin                                     | Purpose                                                           | Verdict                    | Notes                                                                                                                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eslint-plugin-simple-import-sort`         | Semantic/alphabetical import order, autofixable                   | 🟢 Keep                    | Zero friction so far, purely mechanical                                                                                                                                                                     |
| `eslint-plugin-unused-imports`             | Flags + autofixes unused imports                                  | 🟢 Keep                    | Stricter than the bare `no-unused-vars`, no issues                                                                                                                                                          |
| `eslint-plugin-sonarjs`                    | Cognitive complexity, nested ternaries/templates, code smells     | 🟢 Keep                    | Best signal-to-noise of the batch — every finding so far was real (see log)                                                                                                                                 |
| `eslint-plugin-unicorn`                    | General JS/TS best practices                                      | 🟡 Keep, autofix with care | Real findings are good (immutable array methods, type aliases), but its `--fix` has broken type-checking twice (see log) — never trust its autofix blindly, always re-run `tsc` after                       |
| `eslint-plugin-tailwindcss`                | Tailwind class validation (conflicts, redundant arbitrary values) | 🟡 Keep, ordering disabled | `no-custom-classname` off (this repo's CUBE CSS Blocks are intentional custom classes), `classnames-order` off (fights `prettier-plugin-tailwindcss`, see Compatibility)                                    |
| `eslint-plugin-security`                   | Common Node/JS vulnerability patterns                             | 🟡 Keep, mostly quiet      | Only rule that's fired is `detect-object-injection`, and every hit so far has been a false positive (bounded-array indexing) — kept at `warn`, not worth `error`                                            |
| `eslint-plugin-no-secrets`                 | Entropy-based detection of hardcoded tokens/keys                  | 🟡 Keep, tuned             | Default tolerance (4) flagged an ordinary camelCase identifier as a "secret"; raised to `4.5`. Hasn't caught a real secret yet (none committed), but cheap insurance given this repo talks to Gemini + Neon |
| `prettier` + `prettier-plugin-tailwindcss` | Formatting + Tailwind class sorting                               | 🟢 Keep                    | Owns all formatting and class ordering exclusively (see Compatibility — don't let `eslint-plugin-tailwindcss` also try to order classes)                                                                    |

**Legend**: 🟢 no caveats · 🟡 keep, but with a specific caveat noted · 🔴 would remove (none yet)

## Compatibility notes

- **`eslint-plugin-unicorn` version pin**: latest (`^73`) requires `eslint@>=10.4`; this repo is on
  `eslint@^9`. Pinned to `^61.0.2`, the last major that supports `eslint@>=9.29`. Revisit this pin
  if/when the project bumps ESLint to v10.
- **Tailwind class ordering — one owner only**: `eslint-plugin-tailwindcss`'s `classnames-order` rule
  and `prettier-plugin-tailwindcss` both sort Tailwind classes, but their algorithms don't always agree
  (arbitrary values like `tracking-[0.18em]` were a common disagreement point). Running both as
  `error` meant every save fought itself. Resolution: Prettier owns ordering, `classnames-order` is
  off. The rest of `eslint-plugin-tailwindcss`'s rules (contradicting classes, unnecessary arbitrary
  values) don't overlap with Prettier and stay on.
- **`eslint-plugin-tailwindcss` needs the real CSS entry point**: this project uses Tailwind v4
  (`@theme` in CSS, no `tailwind.config.js`). The plugin's `cssConfigPath` setting must point at
  `src/app/globals.css` directly — without it, it looks for a nonexistent `tailwind.config.js`-style
  file and crashes on lint.
- **`unicorn`'s autofix is not safe to trust unattended**: twice now, `--fix` produced code that passed
  ESLint but failed `tsc --noEmit` or changed real behavior (see log). The lint pipeline (pre-commit
  hook, CI) always runs `eslint` and `tsc --noEmit` as separate steps — never assume a clean ESLint
  run means the code still type-checks.

## Incident log

- **2026-08-15** — Initial rollout. `sonarjs/cognitive-complexity` flagged `GameRound.tsx`'s main
  component at 16 (limit 15); fixed by extracting the conditional render tree into a separate
  `RoundContent` component. Also caught nested ternaries in `CardFormModal.tsx`, `FormField.tsx`, and
  `ManageDashboard.tsx` (`sonarjs/no-nested-conditional` + `unicorn/no-nested-ternary`), and nested
  template literals in `src/lib/ai/context.ts` / `src/lib/ai/generate.ts`
  (`sonarjs/no-nested-template-literals`) — all genuine readability/risk issues, all fixed by
  extracting to intermediate variables or if/else.
- **2026-08-15** — `unicorn/no-array-callback-reference` caught `rows.map(mapCardRow)` in `src/lib/db.ts`
  (passing a named function reference directly to `.map()` — fragile if the function ever gains a
  second parameter). `unicorn/no-array-sort` caught in-place `.sort()` calls in `ManageDashboard.tsx`;
  switched to the immutable `.toSorted()`. `sonarjs/use-type-alias` caught the same
  `string | Date | null` union repeated 3× in `db.ts`; extracted to a `RawTimestamp` type alias.
- **2026-08-15** — **Autofix regression #1**: `unicorn/no-useless-undefined --fix` stripped the
  `undefined` argument from `parseSessionCookie(undefined)` in `auth.test.ts` and
  `isAvatarColorName(undefined)` in `avatar.test.ts`. Both parameters are typed `T | undefined` (not
  optional) — the argument was load-bearing, not useless. `tsc` caught the break immediately
  (`Expected 1 arguments, but got 0`). Fixed by restoring the argument and setting
  `{ checkArguments: false }` on the rule so it stops touching call sites (still checks variable
  initializers).
- **2026-08-15** — **Autofix regression #2**: an unrelated `unicorn` autofix (prefer `.at(-1)` over
  index access) turned `nodes[nodes.length - 1]` into `nodes.at(-1)` in `Modal.tsx`. Semantically
  equivalent at runtime, but `.at()`'s return type is `T | undefined` even when a prior length check
  guarantees a hit — `tsc` flagged `'last' is possibly 'undefined'`. Fixed with an explicit
  `if (!last) return;` guard.
- **2026-08-15** — `no-secrets/no-secrets` (default tolerance 4) flagged the identifier
  `pickRandomTruthLevel` as a high-entropy "secret" (score 4.22) — a false positive on an ordinary
  camelCase function name, not a leaked token. Raised `tolerance` to `4.5` project-wide.
- **2026-08-15** — `security/detect-object-injection` fired on 4 sites, all bounded-array indexing
  (`RANK_BADGES[index]`, similar patterns in `CountdownView.tsx`, `draw.ts`, `ai/generate.ts`) — no
  user-controlled key involved in any of them. Left as `warn` (the plugin's own recommended default);
  no fix applied, logged here as a known false-positive class for this rule in this codebase.
- **2026-08-15** — **False positive**: `tailwindcss/no-unnecessary-arbitrary-value` suggested replacing
  `leading-[0.95]` with a bare `leading-0.95` in `src/app/page.tsx`. Verified empirically (computed
  `line-height` via a headless-browser check) that the bare form silently falls back to Tailwind's
  default `1.5` in this project's Tailwind v4 setup — it doesn't generate the utility at all, unlike
  `leading-1.1` elsewhere in the same file, which does work bare. Kept the bracket form and suppressed
  the rule on that one line with a comment explaining why, rather than trusting the rule's fix.
