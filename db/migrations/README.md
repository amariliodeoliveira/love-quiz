# Database migrations

Each production schema change is a reviewed, forward-only SQL file in this directory:

```text
YYYYMMDDHHMM_descriptive_name.sql
```

The filename's timestamp provides a stable ordering. Migrations must be idempotent where
practical, use a transaction when PostgreSQL permits it, and be reviewed before execution.

This repository intentionally does not auto-run migrations: `.env.local` connects to the
production Neon database. An agent may prepare and test a migration on a Neon branch, but
must obtain explicit approval before applying a schema or data migration to production.

After applying a migration:

1. Record the execution and Neon branch in the pull request or commit notes.
2. Update `db/schema.sql`, the readable production snapshot.
3. Update the affected types, queries, and tests.

Never edit, delete, reorder, or rewrite a migration that may already have run. Add a new
forward migration instead.
