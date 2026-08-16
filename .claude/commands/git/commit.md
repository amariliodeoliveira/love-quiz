---
description: Reviews changes, creates focused commits, and delivers them under the repository's AI-first Git policy
---

Follow `.claude/git-guidelines.md`. Inspect staged, unstaged, and untracked changes; distinguish task work
from pre-existing user work; split unrelated concerns; then create the requested focused commit(s).
When the request is to finish or deliver the work, push under the repository policy and monitor CI.

If changes of different types are staged together, split them into multiple commits as shown in
`git-guidelines.md`. Use patch staging for mixed files and never absorb unrelated user changes.

## Commit conventions

Message layout: `<type>(optional-scope): description in English`

**Allowed types**

| Type       | Use                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------- |
| `feat`     | New feature                                                                                   |
| `fix`      | Bug fix                                                                                       |
| `hotfix`   | Urgent production fix                                                                         |
| `refactor` | Refactor without functional change                                                            |
| `chore`    | Maintenance / tooling (e.g. lint config, pipeline tweaks, dependency cleanup, folder renames) |
| `docs`     | Documentation only                                                                            |
| `test`     | Tests only                                                                                    |

Examples:

- `feat(tax): add detailed tax breakdown on receipt`
- `fix(auth): reject expired refresh tokens`
- `refactor(payment): extract Stripe webhook handler`

**Rules**

- Imperative mood (`add`, `fix`, not `added`, `fixed`).
- **Scope** is recommended (module or area, e.g.: `auth`, `api`, `web`, `billing`).
- Keep the first line ≤ 72 characters when possible.
- Body optional for rationale; use `BREAKING CHANGE:` in the footer when needed.
