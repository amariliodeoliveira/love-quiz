# Couples Card Deck

A private, shared card deck for two people. It currently brings together a
Truth or Dare game and a countdown to the next time they will be together.

The game is a visual guide for playing on a call or in person. It does not ask
players to enter their answers: one person reads a truth to the other, and the
conversation happens away from the screen.

## What is here now

- A signed-in Truth or Dare deck with light, medium, and heavy truth cards.
- Dares as an alternative to answering a truth, with completion tracking.
- A shared history: answered truths leave the draw pool, while dares remain
  available for later rounds.
- A Deck Studio for creating, editing, reactivating, and reviewing cards.
- AI assistance in two places: draft a card in Deck Studio, or generate a new
  truth when the manual truth deck runs out during a game.
- A rules page that explains the shared game flow, boundaries, dares, adult
  topics, and AI-generated cards.
- A shared countdown, user profiles, themes, and signed session-based access.

The game rules are part of the product contract. Read them at
[`/truth-or-dare/rules`](http://localhost:3000/truth-or-dare/rules) when the
development server is running.

## Stack

- [Next.js](https://nextjs.org/) 16 with the App Router and React 19
- TypeScript and Tailwind CSS v4
- Postgres on [Neon](https://neon.com/) through `@neondatabase/serverless`
- [next-intl](https://next-intl.dev/) for UI copy, currently with English as the
  single configured locale
- Vercel AI SDK with Google's Gemini Flash Lite model for card generation
- Vitest and Testing Library for automated tests

## Local setup

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app needs a `.env.local` file. Never commit that file: it connects to the
real Neon database. Configure these variables:

```text
POSTGRES_URL=...
ADMIN_SESSION_SECRET=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

`GOOGLE_GENERATIVE_AI_API_KEY` is only required for AI card generation. See the
[database guidelines](.agents/references/database-guidelines.md) before using
the database locally or making a schema change.

## Useful commands

```bash
npm run dev          # Start the local development server
npm run lint         # Run ESLint
npm run test         # Run the Vitest suite once
npm run test:watch   # Run Vitest in watch mode
npm run build        # Create a production build
npm run format       # Format supported files with Prettier
```

For manual authenticated QA, the repository provides a disposable test-user
helper. It uses `.env.local` and therefore talks to the configured database.
Create the account only for a test session and clean it up afterward:

```bash
npm run db:qa-user:create
npm run db:qa-user:cleanup
```

## Project map

```text
src/app/                 Routes, API handlers, and UI components
src/app/manage/          Authenticated deck management
src/app/truth-or-dare/   Deck landing page, game round, and rules
src/lib/                 Shared domain logic and co-located Vitest tests
src/lib/ai/              Generation prompts, context, model, and rate limiting
src/data/                Card levels and rules-page structure
src/i18n/                next-intl request configuration
messages/en.json         English UI and rules copy
db/migrations/           Forward-only, manually applied production migrations
db/schema.sql            Readable snapshot of the production schema
docs/vision.md           Longer-term product direction; not a delivery roadmap
```

## Development notes

- Keep user-facing text in `messages/en.json`. The app is English-only today,
  but the `next-intl` setup makes additional locales a deliberate future change
  rather than a rewrite.
- Treat AI as a card-writing assistant, not a referee. Generation prompts include
  the game rules and answered-card context to avoid repeated topics and
  inappropriate assumptions.
- Database changes are forward-only migrations. They are never applied
  automatically because local credentials may target production.
- Tests live next to the shared logic they cover. Run `npm run test` and
  `npm run lint` before committing behavioral changes.

## Project guidance

Repository conventions live in [`.agents/references/`](.agents/references/):
[engineering guidelines](.agents/references/engineering-guidelines.md),
[design guidelines](.agents/references/design-guidelines.md),
[database guidelines](.agents/references/database-guidelines.md),
[testing guidelines](.agents/references/testing-guidelines.md), and
[Git guidelines](.agents/references/git-guidelines.md).

For the product's longer-term direction beyond the current deck and countdown,
see [the product vision](docs/vision.md).
