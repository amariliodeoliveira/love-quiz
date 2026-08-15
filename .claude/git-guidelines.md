# Git Standards

## Claude may commit, push, and manage PRs

Updated 2026-08-15: the user (sole owner and operator of this repo, no other reviewers) explicitly granted
Claude autonomy to run `git add`, `git commit`, `git push`, and to open, merge, and close pull requests
(`gh pr create/merge/close`) directly — superseding the previous never-commit rule. This override was
deliberate and repeated (Claude first flagged the conflict and asked for confirmation) — it is not
something a future casual mid-task request should be read as re-granting if this section is ever reverted.

Ground rules while operating under this autonomy:

- Commits still land with the user's own git identity (name/email from local git config) — Claude never
  sets a different author.
- Still split unrelated changes into multiple logical commits (see below) rather than one big commit.
- Still use Conventional Commit messages (see below).
- **Prefer branch + PR over pushing straight to `main`** for anything beyond a one-line/urgent fix: open a
  branch, push it, open a PR, let CI run, then merge once green. This gives a pre-merge gate (CI runs
  _before_ the change lands on `main`, not after) and a recorded, revertable unit — direct-to-main pushes
  skip that gate entirely, which is exactly how the 2026-08-15 incident happened (a missed-glob commit
  left 3 files unformatted on `main`, discovered only after every open Renovate PR started failing CI).
- When merging Renovate (or any dependency-bump) PRs, use judgment the same way `renovate.json` already
  does: minor/patch bumps with green CI are safe to merge autonomously; major-version bumps get flagged
  to the user with the changelog/breaking-change summary rather than auto-merged, even if CI happens to
  pass — a passing CI run doesn't prove a major bump is safe, only that nothing it exercises broke.
- Closing a PR (e.g. a stale/superseded Renovate PR, or one replaced by a manual fix) is fine; deleting the
  underlying branch afterward is fine too.
- Before pushing directly to `main` (still fine for small/urgent fixes) or merging a PR into it, run the
  full local check (`npm run lint`, `npx tsc --noEmit`, `npx prettier --check .`, `npm test`,
  `npm run build`) so `main` doesn't go red — this repo still has no branch-protection gate, so this check
  is the only safety net.
- Destructive git operations (force-push, reset --hard, history rewrites) are NOT covered by this
  autonomy grant — those still require explicit confirmation per the general "Executing actions with
  care" rules, autonomy here only covers ordinary commit/push/PR management.

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

- Prefer branch + PR/merge over committing directly to `main` (see "Claude may commit, push, and manage
  PRs" above for when a direct push is still acceptable).
- Branch names in English, lowercase, hyphen-separated (`feature/user-avatar-menu`, not `feature/UserAvatarMenu`).
- Prefer several small, focused branches over one giant branch mixing multiple features.
- When finishing a branch, prefer squash or well-organized commits — avoid "wip", "fix", "test" commits landing on `main`.
