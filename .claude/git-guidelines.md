# Git Standards

## Claude never commits or pushes

Claude must NEVER run `git commit`, `git push`, or any command that creates/modifies commits or pushes to a remote — not even when explicitly asked to "commit this" mid-task. Instead, Claude always outputs the exact commands (`git add ...`, `git commit -m "..."`, `git push ...`) as text for the user to copy and paste into their own terminal.

This applies regardless of permission mode or how routine the change seems. The only actions Claude may run directly are read-only ones (`git status`, `git diff`, `git log`, etc.) to prepare the right commands.

## Breaking up large changes

When a session produces many unrelated changes at once, Claude must identify the logical groups and propose **multiple separate commits** — one per concern — instead of one big commit. Each proposed commit should list which files/hunks belong to it and the commit message for that group.

Example output shape:

```
Commit 1 — fix(auth): handle expired session token
  git add src/lib/auth.ts src/lib/auth.test.ts
  git commit -m "fix(auth): handle expired session token"

Commit 2 — feat(deck): add truth-or-dare card type
  git add src/app/truth-or-dare/
  git commit -m "feat(deck): add truth-or-dare card type"
```

## Commit messages

Use Conventional Commits:

```
<type>(optional but recommended scope): description
```

Common types:

- `feat`: new feature
- `fix`: bug fix
- `refactor`: code change that is neither a fix nor a feature
- `chore`: maintenance (deps, config, build) with no behavior change
- `docs`: documentation only
- `test`: adding or adjusting tests
- `style`: formatting, no logic change

Examples:

```
feat(tax): commit description
fix(auth): commit description
refactor(payment): commit description
```

Rules:

- Description in the imperative mood (`add`, `fix`, `update` — not `added`, `fixed`).
- Scope in parentheses referencing the affected module/area (`auth`, `profile`, `deck`, etc).
- The commit body (if needed) explains _why_, not _what_.
- Don't mix unrelated types in one commit (e.g. a `fix` and a `feat` together) — split them.

## Git Flow

Branches:

- `main`: always stable, reflects production.
- `develop`: integration branch (if the project adopts one), where features land before going to `main`.
- `feature/<short-name>`: one branch per feature, created from `develop` (or `main` if there's no `develop`).
- `fix/<short-name>`: non-urgent fixes.
- `hotfix/<short-name>`: urgent fix directly off `main`, merged back into both `main` and `develop`.
- `release/<version>`: when it makes sense to stage a release before the final merge into `main`.

General rules:

- Never commit directly to `main`. Always via branch + PR/merge.
- Branch names in English, lowercase, hyphen-separated (`feature/user-avatar-menu`, not `feature/UserAvatarMenu`).
- Prefer several small, focused branches over one giant branch mixing multiple features.
- When finishing a branch, prefer squash or well-organized commits — avoid "wip", "fix", "test" commits landing on `main`.
