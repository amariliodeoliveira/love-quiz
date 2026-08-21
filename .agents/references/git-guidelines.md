# Git Standards

## AI-first delivery autonomy

The user, as sole owner and operator, authorizes Codex to run ordinary `git add`, `git commit`, and `git push` operations while delivering requested project work. Keep the user's configured Git identity; do not change it.

- Deliver changes through focused branches and pull requests by default, including during the early single-maintainer phase. Direct pushes to `main` require the owner's explicit request or an emergency fix that cannot wait for review.
- Use a branch and PR for database or destructive data work, authentication or security changes, major dependency upgrades, deployment or CI changes, sweeping or uncertain refactors, discardable experiments, or unclear rollback paths.
- Before opening a PR, present its intended scope, base branch, and reason for isolation, then wait for the user's explicit confirmation. Before merging any PR, wait for a separate explicit confirmation after reporting its CI and review state. Do not infer either approval from a general request to implement, finish, or deliver work.
- Merge minor and patch dependency bumps with green CI autonomously. Summarize major-version changelogs and breaking changes for the user instead of auto-merging.
- Split unrelated work into logical commits. Never include pre-existing user changes.
- Let Husky run lint-staged; do not bypass the hook. It formats staged files and runs full `tsc --noEmit` for TypeScript changes.
- Before direct pushes, run tests relevant to the behavior. Run full `npm test` and `npm run build` for broad, runtime-sensitive, dependency, or release-like work.
- Monitor GitHub Actions after every push. Do not call delivery complete while CI is pending.
- Treat a green pull-request CI run as required before merging. Until GitHub branch protection is available for this private repository, this remains a delivery rule rather than an enforceable repository setting.
- If `main` becomes red, fix forward when the remedy is clear and low risk; otherwise revert. After green CI, confirm the remote commit, clean task state, and deployment health when applicable.
- Force-pushes, hard resets, and history rewrites always require explicit confirmation.

## Commits and branches

Use Conventional Commits in English:

```text
<type>(optional-scope): imperative description
```

Use `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, or `style` as appropriate. Explain why in a commit body when one is useful. Use lowercase, hyphenated English branch names such as `feature/user-avatar-menu` or `fix/session-expiry`; avoid WIP commits reaching `main`.

After a merged pull request has a green `main` CI run, delete its remote branch and then its local branch. Keep a branch only when it is the declared base of an unmerged stacked pull request.

## Epic integration branches

Use an `epic/<slug>` branch only when an initiative needs multiple independently reviewed changes and integrated QA before it can safely reach `main`. It is a temporary integration branch, not a release branch and not a permanent `develop` branch.

- Create each child from the epic base and name it `feature/<epic>-<slice>`, `fix/<epic>-<slice>`, or another standard type prefix that describes one reviewable slice.
- Child PRs target `epic/<slug>`. Require their CI to pass before merging, then let the push CI on the epic branch validate the integrated state.
- Open one final PR from `epic/<slug>` to `main` only after its acceptance criteria and integrated QA are complete. It requires green CI and the owner's explicit merge confirmation.
- Delete child branches after their PRs merge into the epic branch. Delete the epic branch only after its final PR has merged and `main` is green.

## Stacked pull requests and rollout dependencies

- A normal PR must be independently mergeable and deployable. Split unrelated work rather than using a stack as a way to hide an oversized diff.
- When a change genuinely depends on an unmerged prerequisite, make that dependency explicit: create the child from the prerequisite branch, target the child PR at that branch, and put `Depends on #<number>` at the top of its body. Keep stacks short and state the intended merge order.
- Never merge a child into `main` before every prerequisite has merged, deployed where necessary, and been verified. After the prerequisite merges, retarget the child to `main`, refresh its CI, and confirm its diff still contains only the remaining change. This retargeting rule does not apply to child PRs deliberately based on an `epic/<slug>` integration branch; those stay targeted at the epic until the final epic PR goes to `main`.
- A merged migration PR is not evidence that production has the schema. Application code may consume a new table, column, index, constraint, or permission only after the migration has been applied and verified in the target environment.
- Use expand/contract delivery for schema-dependent changes: ship an additive, backwards-compatible migration; apply and verify it; ship code that uses it; only later remove obsolete schema or compatibility code in a separate change.

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
- For a stacked PR, add a brief `Dependencies` note with its parent PR, merge order, migration/application status, and the exact condition that makes the child safe to merge.
