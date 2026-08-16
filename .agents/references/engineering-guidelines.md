# Engineering Guidelines

## Core principles

Apply these by default:

- **Single Responsibility** — a function, component, or route handler does one thing. Split JSX that combines fetching, presentation, and business rules.
- **DRY, but not premature** — extract shared logic into `src/lib/` after it appears 2–3 times with the same shape. Do not create a helper for one call site “just in case.”
- **Open/Closed via composition** — add behavior through props, children, and composition instead of branching inside shared components or duplicating them.
- **KISS / YAGNI** — do not add abstractions, flags, or generic layers without a current use case.
- **Dependency direction** — UI depends on `src/lib/`; API routes depend on `src/lib/db` and `src/lib/api`, never on UI code.

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
