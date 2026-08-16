# Database Guidelines

## Context

- Postgres runs on Neon. The project uses raw SQL through `@neondatabase/serverless` in `src/lib/db.ts`; there is no ORM.
- `users` and `cards` are documented in [`db/schema.sql`](../../db/schema.sql). The file is documentation, not a migration runner.
- `.env.local` targets the real production database. There is no local or test database.

For isolated migration or data experiments, create a Neon branch rather than reconstructing the database locally.

## Manual or visual QA

Do not create throwaway accounts through signup. Use the disposable QA account script instead:

```text
node --env-file=.env.local scripts/qa-test-user.mjs create
node --env-file=.env.local scripts/qa-test-user.mjs cleanup
```

`create` prints a ready-to-use signed cookie without storing a password. Always run `cleanup` afterward.

## Changing the schema

There is no migration tool. For a schema change:

1. Run the scoped SQL against Neon.
2. Update [`db/schema.sql`](../../db/schema.sql) to match production.
3. Update relevant types and queries in `src/lib/db.ts`.

If the schema may have drifted, ask for live introspection instead of assuming the snapshot is current.

## Hard rules

- Never run `DELETE`, `UPDATE`, `DROP`, or `TRUNCATE` without a `WHERE` limited to a known row, except for a dedicated scoped cleanup script.
- Never perform destructive work on real user data without explicit user approval.
- Read-only queries and catalog introspection are always safe to run.

## Environment variables

- `POSTGRES_URL` is the pooled, request-scoped connection used by `src/lib/db.ts`.
- `POSTGRES_URL_NON_POOLING` / `DATABASE_URL_UNPOOLED` are direct connections for long-lived scripts or session-level features.
- `PGHOST`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` are the same credentials split into fields.
- `POSTGRES_PRISMA_URL` is unused because the project does not use Prisma.
