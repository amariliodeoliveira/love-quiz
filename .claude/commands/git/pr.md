---
description: Creates or updates a PR for changes that benefit from isolation, then monitors CI
---

Using the GitHub CLI:

- Following `.claude/git-guidelines.md`, push the branch and create or update the PR when the task calls
  for PR isolation. Monitor its CI and merge when green if delivery was requested and no high-risk
  ambiguity remains.
- Build the command to open or update a PR from the current branch, targeting origin by default unless another
  branch is explicitly specified.
  - Background:
    - **GIVEN** we have 3 branches (`main`, `branch-a`, and `branch-b`) in the repository
    - **AND** `branch-a` was created from `main`, and `branch-b` from `branch-a`
  - Scenario: PR creation with default target
    - **WHEN** opening the PR for `branch-b`
    - **THEN** the `branch-b` PR should target `branch-a` by default
  - Scenario: PR creation with custom target
    - **WHEN** opening PRs for `branch-b` using `/manage-pr main` or `/manage-pr 'main'`
    - **THEN** the `branch-b` PR should target `main`
- Use the `.github/pull_request_template.md` layout
- For branches that don't implement code, no need to write a "how to test" section
- Title and description written in English

**PR title**: `<type>: brief description of the change`

**<type>**: default to what's contextualized in the branch name

Examples:

- Branch name `feat-253`
  - `feat: add detailed tax breakdown on receipt`
- Branch name `fix-253`
  - `fix: correct tax calculation`

**Other types**

| Type       | Use                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------- |
| `feat`     | New feature                                                                                   |
| `fix`      | Bug fix                                                                                       |
| `hotfix`   | Urgent production fix                                                                         |
| `refactor` | Refactor without functional change                                                            |
| `chore`    | Maintenance / tooling (e.g. lint config, pipeline tweaks, dependency cleanup, folder renames) |
| `docs`     | Documentation only                                                                            |
| `test`     | Tests only                                                                                    |

## Scope

- Generate the PR title and description
- Sign the PR

## Out of scope

- Creating, editing, or deleting comments.
