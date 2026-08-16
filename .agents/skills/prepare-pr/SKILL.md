---
name: prepare-pr
description: Analyze, prepare, open, update, monitor, or merge a focused GitHub pull request when isolation is safer than direct delivery. Use when the user asks to prepare, draft, open, update, review, deliver, or merge a pull request, or when project risk rules require a PR. Always obtain explicit user confirmation before opening or merging a PR.
---

# Prepare a Pull Request

1. Read `.agents/references/git-guidelines.md`, including `Pull request descriptions`, and use a PR for its listed high-risk or isolation-worthy changes. Inspect `.github/pull_request_template.md` when it exists.
2. Inspect the current branch, upstream, status, commits, and diff. Do not include unrelated working-tree changes in the PR summary.
3. Infer the base from branch ancestry rather than always choosing `main`. For a genuine stacked change, target the direct prerequisite branch, record `Depends on #<number>` and merge order in the body, and keep the stack short. Honor an explicitly requested base.
4. Draft the title and body in English. Use `<type>: imperative description` for the title and follow the repository PR template when it exists.
5. Apply the canonical PR description standard. Before publishing, compare the title and body with the
   actual diff, tests, and CI plan; make the review order and focus areas explicit whenever the change
   is not trivially navigable.
6. Check that the branch is pushable and that proportional local checks have run. Report missing or failing checks accurately.
7. Draft only when the user asks for a draft. Before creating a PR, state its intended scope, base branch, and reason for isolation, then wait for explicit user confirmation. A request to implement, finish, deliver, open, update, or merge does not waive this confirmation.
8. Monitor CI through completion. Before merging, report CI and review state and wait for a separate explicit user confirmation. A migration being merged is not enough: do not merge application code that consumes new schema until the migration is applied and read-only verified in the target environment, or a protected deployment pipeline performs both before deploy.
9. After merge, verify the resulting `main` CI and deployment signal when available. Do not comment, close without merge, or delete branches unless useful to the requested delivery workflow.
