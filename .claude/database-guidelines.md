# Database Guidelines

Written for a frontend-leaning team: assume no deep Postgres background, spell out the "why."

## What's here

- Postgres hosted on **Neon** (serverless). No ORM — raw SQL via `@vercel/postgres`'s `sql` tagged template, in `src/lib/db.ts`.
- Two tables: `users`, `cards`. The exact shape (columns, types, constraints, FKs) is snapshotted in [`db/schema.sql`](../db/schema.sql).
- `db/schema.sql` is **documentation, not a migration runner** — nothing applies it automatically. It exists so the DB shape is readable in the repo instead of living only in the Neon console.

## There is only one database today

`.env.local` points at the real (production) Neon database — there is no separate local/test database. Keep that in mind before running anything destructive.

If you ever need an isolated copy (to try a risky migration, load fake data, etc.), prefer a **Neon branch** over spinning up local Postgres/Docker: it's an instant, free, copy-on-write clone of the real database (schema + data), done from the Neon dashboard's "Branches" tab or `neon branches create`. No schema to hand-recreate, no container to maintain. Local Postgres is only worth it if this project outgrows Neon's free branching — not the case today.

## Doing manual or visual QA against real data

Don't create throwaway accounts through the real signup/login flow — it leaves permanent rows and (if you ever do set a real password) a credential to worry about.

Instead, use the checked-in script:

```
node --env-file=.env.local scripts/qa-test-user.mjs create   # prints {userId, username, cookie}
node --env-file=.env.local scripts/qa-test-user.mjs cleanup  # deletes it and any cards it owns
```

`create` inserts a disposable `_qa_visual_test` user directly and prints a ready-to-use `admin_session` cookie value (signed the same way `src/lib/auth.ts` does it) — no password is ever set, so there's nothing to protect or remember. Always run `cleanup` when done.

## Changing the schema

There's no migration tool in this project (no Prisma/Drizzle) — see [engineering-guidelines.md](./engineering-guidelines.md) for why we're not reaching for one yet. When the schema needs to change:

1. Write and run the `ALTER TABLE` / `CREATE TABLE` statement directly against the database (Neon console's SQL editor, or a one-off script like `scripts/qa-test-user.mjs`).
2. Update [`db/schema.sql`](../db/schema.sql) to match — it should always reflect what's actually live.
3. Update the matching types and queries in `src/lib/db.ts`.

If you're not sure the file still matches reality, ask to have it regenerated from a live introspection query rather than trusting it blindly — it can drift if a change was made without updating it.

## Hard rules

- Never run `DELETE`, `UPDATE`, `DROP`, or `TRUNCATE` without a `WHERE` scoped to a specific, known row (or a script whose sole job is exactly that, like the QA script above).
- Never run a destructive statement against real user data without asking first — this database has no test/prod split, so "the database" always means production.
- Read-only queries (`SELECT`, `information_schema`, `pg_catalog` introspection) are always fine without asking.

## Env var quick reference

`.env.local` has several connection strings because Neon/Vercel provide the same database through different URLs for different needs — they're not different databases:

- `POSTGRES_URL` — pooled connection (via PgBouncer). What `@vercel/postgres` uses by default. Use this for anything request-scoped (API routes).
- `POSTGRES_URL_NON_POOLING` / `DATABASE_URL_UNPOOLED` — direct connection, no pooler. Needed for long-lived scripts or session-level features a pooler can break (rare here).
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` — the same credentials broken into parts, for tools that want discrete params instead of a URL.
- `POSTGRES_PRISMA_URL` — pre-formatted for Prisma. Unused (no Prisma in this project).
