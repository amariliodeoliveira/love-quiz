# Testing Guidelines

**TDD is the default for logic in `src/lib/`**: write a failing test, confirm it fails for the right reason, then implement the change. This applies to new logic and bug fixes.

## Required coverage

Every `src/lib/` module with real logic gets a co-located Vitest file (`foo.ts` → `foo.test.ts`). Cover the happy path and meaningful edge cases such as malformed input, tampered signatures, and boundaries. Security and data-integrity code — sessions, passwords, redirect safety, and DB lookup IDs — always grows its tests with the change.

A one-line wrapper around `fetch` need not receive exhaustive tests, but branchy logic or behavior with a realistic failure mode does.

## Deliberately not unit-tested yet

- **React components**: no React Testing Library or jsdom is configured. Visually verify behavior in a browser; revisit if component logic becomes too complex for manual coverage.
- **API route handlers**: keep them thin `withSession(...)` wrappers. Extract branching or validation into a `src/lib/` function and test it there.
- **`src/lib/db.ts`**: it requires the live Postgres database. Do not mock the client; use `scripts/qa-test-user.mjs` for manual verification and revisit when a real test database exists.

## Before calling work done

Run `npm test` and `npm run lint`; TypeScript compilation alone is not behavioral verification.
