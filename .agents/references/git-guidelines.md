# Git Standards

## AI-first delivery autonomy

The user, as sole owner and operator, authorizes Codex to run ordinary `git add`, `git commit`, and `git push` operations and to open, update, merge, and close pull requests while delivering requested project work. Keep the user's configured Git identity; do not change it.

- Work directly on `main` by default during the early single-maintainer phase. Preserve speed with focused commits, the pre-commit hook, proportional checks, and post-push CI monitoring.
- Use a branch and PR for database or destructive data work, authentication or security changes, major dependency upgrades, deployment or CI changes, sweeping or uncertain refactors, discardable experiments, or unclear rollback paths.
- Merge minor and patch dependency bumps with green CI autonomously. Summarize major-version changelogs and breaking changes for the user instead of auto-merging.
- Split unrelated work into logical commits. Never include pre-existing user changes.
- Let Husky run lint-staged; do not bypass the hook. It formats staged files and runs full `tsc --noEmit` for TypeScript changes.
- Before direct pushes, run tests relevant to the behavior. Run full `npm test` and `npm run build` for broad, runtime-sensitive, dependency, or release-like work.
- Monitor GitHub Actions after every push. Do not call delivery complete while CI is pending.
- If `main` becomes red, fix forward when the remedy is clear and low risk; otherwise revert. After green CI, confirm the remote commit, clean task state, and deployment health when applicable.
- Force-pushes, hard resets, and history rewrites always require explicit confirmation.

## Commits and branches

Use Conventional Commits in English:

```text
<type>(optional-scope): imperative description
```

Use `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, or `style` as appropriate. Explain why in a commit body when one is useful. Use lowercase, hyphenated English branch names such as `feature/user-avatar-menu` or `fix/session-expiry`; avoid WIP commits reaching `main`.

## Pull request descriptions

Write PR titles and bodies in English for a human reviewer and future project history.

- Use a specific, imperative title: `<type>: concise description`. Avoid vague titles such as `fix issues`.
- Keep one self-contained objective and its related tests together. Around 800 effective changed lines, many unrelated files, or multiple subsystems are prompts to reconsider scope; around 1,000 normally deserves a split or explicit reviewer agreement.
- Open with one or two short paragraphs covering the problem, why it matters, the approach, and resulting behavior. Explain decisions the diff cannot explain; do not repeat a file list.
- Add `What changed` when it helps scanning, grouped by behavior or design rather than filename.
- Add `How to verify` for behavior changes: give the shortest meaningful reviewer journey, then relevant automated coverage. State only checks that ran or will run in CI.
- Add `Notes` only for real risks or context: security, migrations, breaking changes, rollout, performance trade-offs, screenshots, or follow-up work.
- For non-trivial diffs, tell the reviewer where to start, the preferred reading order, and focus areas. Link necessary issues, design discussions, or dependent PRs.
- Self-review before requesting review. Do not put internal agent narration, command logs, sandbox limitations, empty sections, or routine CI boilerplate in the body.
