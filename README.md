# Couples Card Deck

A small private site for two — a Truth or Dare card deck, and a live countdown to when
we next see each other. Built with Next.js (App Router), React, TypeScript, Tailwind
CSS v4, and Postgres (Neon) via `@neondatabase/serverless`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need a `.env.local` with
the database and session env vars — see [.claude/database-guidelines.md](.claude/database-guidelines.md)
for what each one is for.

## Useful scripts

```bash
npm run lint            # eslint
npm run test            # vitest run
npm run test:watch      # vitest watch mode
npm run build            # production build
npm run db:qa-user:create   # create a disposable logged-in test user (no password)
npm run db:qa-user:cleanup  # remove it
```

## Where things live

- `src/app/_components/` — shared UI (`AppHeader`, `Modal`, `Select`, `UserAvatarMenu`,
  `EmojiText`), plus `countdown/`, `deck/`, and `game/` subfolders for those features'
  own components.
- `src/app/manage/_components/` — dashboard/login-only UI.
- `src/lib/` — shared logic (auth, db, countdown math, geocoding, etc.), tested
  alongside the code it covers (`foo.ts` + `foo.test.ts`).
- `db/schema.sql` — a snapshot of the live schema, kept in sync by hand (see
  [.claude/database-guidelines.md](.claude/database-guidelines.md)).
- `docs/vision.md` — where this project is headed (feed, plans, diary, entertainment
  hub) — not built yet, just captured so it isn't lost.

## Project guidelines

This repo is developed with Claude Code; the guidelines it (and any contributor)
follows live in `.claude/`: [git-guidelines.md](.claude/git-guidelines.md),
[engineering-guidelines.md](.claude/engineering-guidelines.md),
[database-guidelines.md](.claude/database-guidelines.md),
[testing-guidelines.md](.claude/testing-guidelines.md).
