# Database Guidelines

## Context

- Postgres runs on Neon. The project uses raw SQL through `@neondatabase/serverless` in `src/lib/db.ts`; there is no ORM.
- The live shape is documented in [`db/schema.sql`](../../db/schema.sql). It is a readable snapshot, not a migration runner.
- Forward-only, reviewed SQL migrations live in [`db/migrations/`](../../db/migrations/). They are not applied automatically because local credentials target production.
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

For a schema change:

1. Add one forward-only timestamped SQL file to `db/migrations/`, following its README.
2. For any code that needs the new schema, make the migration a prerequisite PR or run it in a protected deployment pipeline before application code deploys.
3. Review it and test it against a Neon branch where practical.
4. Obtain explicit approval before applying it to production Neon.
5. Verify the target schema with a read-only catalog query, then record that evidence in the PR or deployment record.
6. Update [`db/schema.sql`](../../db/schema.sql), relevant types, queries, and tests after application.

If the schema may have drifted, ask for live introspection instead of assuming the snapshot is current.

## Deployment safety

The current CI verifies code but deliberately does not connect to production, so it cannot prove a migration has run. Treat a green build as necessary but insufficient for schema-dependent deployment.

Before enabling an automated production deployment, use one controlled pipeline with this order:

1. Run ordinary CI against the candidate commit.
2. Run approved forward migrations with the direct production connection in a protected `production` environment.
3. Run a read-only schema readiness check for the tables, columns, indexes, and constraints consumed by that release.
4. Deploy the already-built application only after the readiness check passes.
5. Check the deployed health endpoint and retain the migration/deployment record.

Store production database and deployment credentials only as protected environment secrets. If Vercel's Git integration deploys `main` automatically, it bypasses this sequence; disable automatic production deployment before relying on this gate, then deploy from the controlled workflow. Use one deployment concurrency group so a second release cannot overtake an in-progress migration.

## Hard rules

- Never run `DELETE`, `UPDATE`, `DROP`, or `TRUNCATE` without a `WHERE` limited to a known row, except for a dedicated scoped cleanup script.
- Never perform destructive work on real user data without explicit user approval.
- Read-only queries and catalog introspection are always safe to run.

## Environment variables

- `POSTGRES_URL` is the pooled, request-scoped connection used by `src/lib/db.ts`.
- `POSTGRES_URL_NON_POOLING` / `DATABASE_URL_UNPOOLED` are direct connections for long-lived scripts or session-level features.
- `PGHOST`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` are the same credentials split into fields.
- `POSTGRES_PRISMA_URL` is unused because the project does not use Prisma.
