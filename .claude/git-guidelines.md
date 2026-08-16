# Git Standards

## AI-first delivery autonomy

Updated 2026-08-16: this repository is an experiment in an increasingly independent, AI-operated
development workflow. The user (sole owner and operator) explicitly authorizes Claude and Codex to run
ordinary `git add`, `git commit`, and `git push` operations and to open, update, merge, and close pull
requests when delivering requested project work. A request to implement, finish, or deliver a change is
enough authorization to complete this normal delivery loop without asking again.

Ground rules while operating under this autonomy:

- Commits still land with the user's own git identity (name/email from local git config) — Claude never
  sets a different author.
- Still split unrelated changes into multiple logical commits (see below) rather than one big commit.
- Still use Conventional Commit messages (see below).
- **Direct commits and pushes to `main` are the default during the project's early, single-maintainer
  phase.** Preserve speed with small logical commits, the pre-commit hook, proportional local checks,
  and mandatory post-push CI monitoring. Large sessions may produce several focused commits; volume
  alone does not require a PR.
- Use a branch + PR when isolation provides material value: database/schema or destructive data work,
  authentication/security changes, major dependency upgrades, deployment/CI changes, sweeping or
  uncertain refactors, experiments that may be discarded, or any change whose safe rollback is unclear.
- When merging Renovate (or any dependency-bump) PRs, use judgment the same way `renovate.json` already
  does: minor/patch bumps with green CI are safe to merge autonomously; major-version bumps get flagged
  to the user with the changelog/breaking-change summary rather than auto-merged, even if CI happens to
  pass — a passing CI run doesn't prove a major bump is safe, only that nothing it exercises broke.
- Closing a PR (e.g. a stale/superseded Renovate PR, or one replaced by a manual fix) is fine; deleting the
  underlying branch afterward is fine too.
- The Husky pre-commit hook runs `lint-staged`: ESLint fixes and Prettier on relevant staged files, plus
  full `tsc --noEmit` for TypeScript changes. Do not manually repeat those checks without a reason.
- Before a direct push, run tests relevant to changed behavior. Run the full `npm test` and
  `npm run build` for broad, cross-cutting, runtime-sensitive, dependency, or release-like changes.
  Prefer targeted checks during rapid iteration and rely on CI for the clean-environment full suite.
- After every push, monitor the GitHub Actions run through completion. CI runs TypeScript, ESLint,
  Prettier, tests, and the production build. Do not call delivery complete while CI is pending.
- If `main` CI fails, make restoring green the highest-priority task. Fix forward immediately when the
  cause and remedy are clear and low-risk; otherwise revert the offending commit. Report what failed,
  what action was taken, and the final CI state.
- After CI succeeds, audit that the intended commit reached the remote, no task-related changes or files
  were left behind, and the working tree contains only known user work. Verify deployment health when
  the change affects deployment and that signal is available.
- Destructive git operations (force-push, reset --hard, history rewrites) are NOT covered by this
  autonomy grant — those still require explicit confirmation per the general "Executing actions with
  care" rules, autonomy here only covers ordinary commit/push/PR management.

## Breaking up large changes

When a session produces many unrelated changes at once, the agent must identify the logical groups and
create **multiple separate commits** — one per concern — instead of one big commit. Before staging, keep
pre-existing user changes out of the task's commits. Use patch staging when a file contains mixed concerns.

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

## Git flow

Branches:

- `main`: always stable, reflects production.
- `develop`: integration branch (if the project adopts one), where features land before going to `main`.
- `feature/<short-name>`: one branch per feature, created from `develop` (or `main` if there's no `develop`).
- `fix/<short-name>`: non-urgent fixes.
- `hotfix/<short-name>`: urgent fix directly off `main`, merged back into both `main` and `develop`.
- `release/<version>`: when it makes sense to stage a release before the final merge into `main`.

General rules:

- Work directly on `main` by default while the project is early and has one maintainer. Switch to a
  branch + PR based on risk, uncertainty, or need for isolation, not merely change size.
- Branch names in English, lowercase, hyphen-separated (`feature/user-avatar-menu`, not `feature/UserAvatarMenu`).
- Prefer several small, focused branches over one giant branch mixing multiple features.
- When finishing a branch, prefer squash or well-organized commits — avoid "wip", "fix", "test" commits landing on `main`.
