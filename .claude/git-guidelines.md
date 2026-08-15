# Git Standards

## Claude may commit and push

Updated 2026-08-15: the user (sole owner and operator of this repo, no other reviewers) explicitly granted
Claude autonomy to run `git add`, `git commit`, and `git push` directly, superseding the previous
never-commit rule. This override was deliberate and repeated (Claude first flagged the conflict and asked
for confirmation) — it is not something a future casual mid-task request should be read as re-granting if
this section is ever reverted.

Ground rules while operating under this autonomy:

- Commits still land with the user's own git identity (name/email from local git config) — Claude never
  sets a different author.
- Still split unrelated changes into multiple logical commits (see below) rather than one big commit.
- Still use Conventional Commit messages (see below).
- Before pushing, run the full local check (`npm run lint`, `npx tsc --noEmit`, `npx prettier --check .`,
  `npm test`, `npm run build`) so `main` doesn't go red — this repo has no PR gate, so a broken `main` is
  the only safety net (and Renovate PRs rebase straight off it — see the 2026-08-15 incident where a
  missed-glob commit left 3 files unformatted on `main` and failed every open Renovate PR).
- Destructive git operations (force-push, reset --hard, history rewrites) are NOT covered by this
  autonomy grant — those still require explicit confirmation per the general "Executing actions with
  care" rules, autonomy here only covers ordinary commit/push.

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
