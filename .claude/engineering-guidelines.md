# Engineering Guidelines

## Core principles

Apply these by default, without being asked each time:

- **Single Responsibility** — a function/component/route handler does one thing. If a component's JSX has more than one clear reason to change (data-fetching + presentation + business rules), split it.
- **DRY, but not premature** — extract shared logic into `src/lib/` once it's duplicated 2-3+ times with the same shape (see `routes.ts`, `http.ts`, `id.ts`, `url.ts`, `useClickOutside.ts` for the existing pattern). Don't extract a helper for a single call site "just in case."
- **Open/Closed via composition** — prefer adding behavior through props/children/composition (like `AppHeader` taking `backHref`/`backLabel`/`user`) over branching inside a shared component (`if (page === "profile") ...`) or duplicating the component.
- **KISS / YAGNI** — no abstractions, config flags, or generic layers for a use case that doesn't exist yet. Three similar lines beat a premature abstraction.
- **Dependency direction** — UI components depend on `src/lib/` helpers, never the other way around. API routes depend on `src/lib/db` and `src/lib/api`, not on UI code.

## React / Next.js specifics

- Server components by default. Add `"use client"` only when the component needs state, effects, or browser APIs.
- Route protection and cross-cutting request logic (auth, redirects) belongs in `src/proxy.ts` / `withSession`, not duplicated per-page.
- Shared UI (headers, menus, form fields) gets its own component under `_components/` before a second page copy-pastes it.

## Styling: Tailwind-first, CUBE CSS for the rest

This project uses **Tailwind v4** (`@import "tailwindcss"`, no `tailwind.config.js` — config lives in CSS via `@theme`). The intended methodology is **CUBE CSS**, because — unlike Atomic Design, which is a component-hierarchy convention (atoms/molecules/organisms) and says nothing about how CSS itself should be written — CUBE is a CSS-authoring strategy built around utility-first frameworks like Tailwind:

- **Composition** — layout (flex/grid, gaps, alignment) is Tailwind utilities directly in JSX. Don't invent a custom class for something Tailwind already expresses (`flex`, `gap-4`, `items-center`).
- **Utility** — one-off visual tweaks (spacing, color, sizing) are Tailwind utilities in JSX, not new global CSS classes.
- **Block** — a custom, semantically-named class (`.hero`, `.card`, `.avatar-menu`) is justified ONLY for a genuinely reusable, multi-property visual pattern that would be unreadable as a long utility string. Blocks are defined with Tailwind's `@layer components` + `@apply`, kept small, and colocated in a CSS partial named after the feature (not dumped into one giant `globals.css`).
- **Exception** — state/variant styling (`.open`, `.active`) is a small modifier class or a conditional Tailwind class applied in JSX, not a parallel class hierarchy.

Practical rules:

- Before adding a new custom CSS class, check whether Tailwind utilities already cover it. Most one-off styling should never touch a `.css` file.
- Design tokens (colors, spacing scale) live in `@theme` in `src/app/globals.css`, not hand-rolled `:root` variables — that's what makes them usable as Tailwind utilities (`bg-bg`, `text-muted`, etc.) instead of only via `var(--x)`.
- Split feature-specific Block styles into partials under `src/app/styles/` (e.g. `hero.css`, `cards.css`, `profile.css`) and `@import` them from `globals.css`, instead of appending to one file. `globals.css` itself should only hold `@import`s, `@theme`, and true resets.
- When migrating existing hand-rolled CSS, do it feature-by-feature (one section at a time), verifying lint/build after each slice — not as one giant rewrite.
