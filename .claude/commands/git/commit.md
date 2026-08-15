---
description: Prepares commit message(s) from staged changes and prints the git commands for the user to run
---

Analyze only the files in `Staged Changes` (`git diff --staged`) and, following `.claude/git-guidelines.md`,
print the `git add` / `git commit -m "..."` commands ready for the user to copy and paste — never run
`git commit`, `git push`, or any variation directly.

If changes of different types are staged together, split them into multiple proposed commits (one command
block per commit), as shown in the example in `git-guidelines.md`.

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
