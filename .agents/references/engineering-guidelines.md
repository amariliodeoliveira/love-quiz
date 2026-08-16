# Engineering Guidelines

## Core principles

Apply these by default:

- **Single Responsibility** — a function, component, or route handler does one thing. Split JSX that combines fetching, presentation, and business rules.
- **DRY, but not premature** — extract shared logic into `src/lib/` after it appears 2–3 times with the same shape. Do not create a helper for one call site “just in case.”
- **Open/Closed via composition** — add behavior through props, children, and composition instead of branching inside shared components or duplicating them.
- **KISS / YAGNI** — do not add abstractions, flags, or generic layers without a current use case.
- **Dependency direction** — UI depends on `src/lib/`; API routes depend on `src/lib/db` and `src/lib/api`, never on UI code.

## Forms and validation

- Use **React Hook Form + Zod** for new non-trivial interactive forms. Keep inputs native when possible; do not add a controlled-component adapter unless a component truly requires one.
- Define a form schema in `src/lib/<domain>.ts`. Client validation improves feedback; the route must parse and validate the same request independently before any side effect.
- Use the shared `src/app/_components/FormField.tsx` pattern for labels, help text, and field errors. Invalid controls need `aria-invalid`, a programmatically associated textual error, and a visual state — never color alone.
- Migrate existing forms only while touching their behavior or when the duplicated validation is demonstrably costly. Do not create a repository-wide rewrite just to standardize APIs.

## Data boundaries

- Keep `src/lib/db.ts` as the public database facade while the application has one implementation. When a second independently maintained domain needs data access, extract it to `src/lib/db/<domain>.ts` and re-export it from the facade to keep callers stable.
- Keep SQL parameterized. Dynamic identifiers must come from a fixed allowlist owned by the module, never request input.
- Version every production schema change in `db/migrations/`; `db/schema.sql` is a readable snapshot, not an executable migration.

## AI-first development

- Optimize for auditable decisions, not merely fast generated code: preserve intent in tests, schema migrations, focused commits, and concise comments around non-obvious invariants.
- Treat generated output as a proposal. Inspect diffs, keep changes small enough to review, and verify behavior proportionally; passing type checks alone are not evidence of runtime correctness.
- Prefer explicit contracts at trust boundaries (HTTP, database, auth, external APIs). Do not infer authorization, ownership, or data shape from UI state.
- Make workflows deterministic and repeatable: commands, checks, migrations, and acceptance criteria belong in version control rather than only in agent conversation.

## React / Next.js

- Use Server Components by default. Add `"use client"` only for state, effects, or browser APIs.
- Keep route protection and cross-cutting request logic in `src/proxy.ts` or `withSession`, rather than duplicating it per page.
- Extract shared UI under `_components/` before a second page duplicates it.

## Styling: Tailwind-first, CUBE CSS for the rest

The project uses Tailwind v4 (`@import "tailwindcss"`; configuration lives in CSS via `@theme`) with CUBE CSS:

- **Composition** — express layout with Tailwind utilities in JSX.
- **Utility** — keep one-off visual tweaks in Tailwind utilities, not global CSS classes.
- **Block** — add a small, semantic class only for a reusable multi-property pattern that would be unreadable as utilities. Define it with `@layer components` and `@apply` in a feature-scoped partial under `src/app/styles/`.
- **Exception** — express state and variants with a small modifier class or conditional Tailwind class, not a parallel class hierarchy.

Before adding a custom CSS class, confirm Tailwind cannot express it clearly. Keep tokens in `@theme` in `src/app/globals.css`, split feature Block styles into partials, and migrate existing CSS one feature at a time with verification after each slice.
