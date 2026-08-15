# Testing Guidelines

No strict TDD here (write-test-first for everything) — that's a process discipline that pays off more in larger teams than in a small project like this one. Instead, this codifies the coverage split that's already in place: pure logic in `src/lib/` is tested; components, API route wiring, and the DB layer deliberately aren't (yet).

## Required: pure logic in `src/lib/`

Every module in `src/lib/` that has real logic (not just re-exports or thin glue) gets a co-located test file: `foo.ts` → `foo.test.ts`, same directory. See `auth.test.ts`, `avatar.test.ts`, `id.test.ts`, `url.test.ts`, `proxy.test.ts` for the existing pattern — Vitest, `describe`/`it`, one behavior per `it`, cover the happy path plus the edge cases that would actually break something (malformed input, tampered signatures, boundary values).

This is **non-negotiable for security/data-integrity code** — session signing/parsing, password hashing, redirect-target safety, id parsing used in DB lookups. If you're touching `auth.ts`, `url.ts`, or similar, the test file grows with it, no exceptions.

For everything else in `src/lib/`, use judgment: a one-line wrapper around `fetch` (`http.ts`) doesn't need exhaustive tests, but anything with a branch or an edge case worth getting wrong does.

## Deliberately not unit-tested (for now)

- **React components** (`_components/**/*.tsx`). No React Testing Library / jsdom is set up (`vitest.config.ts` runs in the `node` environment). Adding that infra is a real cost; for this project's size, driving the actual page in a browser (the `run` skill / a Playwright screenshot, as used for the CUBE CSS migration) catches real rendering bugs more cheaply than a component test harness would. Revisit if a component's logic (not its markup) gets complex enough that manual verification stops being reliable.
- **API route handlers** (`src/app/api/**/route.ts`). These are thin `withSession(...)` wrappers today — see [engineering-guidelines.md](./engineering-guidelines.md). If a handler grows real branching/validation logic, extract that logic into a `src/lib/` function and test it there, rather than writing a route-level integration test. Keeps the same coverage without needing a request-mocking harness.
- **`src/lib/db.ts`**. Needs a live Postgres connection — there's no local/test database (see [database-guidelines.md](./database-guidelines.md)), and mocking the DB client would test the mock, not the query. Manual/visual verification via `scripts/qa-test-user.mjs` is the current substitute. Revisit if this project ever gets a real test database (e.g. a Neon branch wired into CI).

## Bug fixes: reproduce first

When fixing a bug in anything covered above, write the failing test that reproduces it _before_ fixing the code — confirm it fails for the right reason, then fix, then confirm it passes. This is the one place a TDD-style loop earns its keep here: it's cheap, and it's the difference between "fixed" and "fixed until it quietly comes back."

## Before calling something done

Run `npm test` (and `npm run lint`) — don't rely on TypeScript compiling as a substitute for behavior being correct.
