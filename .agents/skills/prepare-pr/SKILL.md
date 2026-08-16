---
name: prepare-pr
description: Analyze changes and create, update, monitor, or merge a focused GitHub pull request when isolation is safer than direct delivery. Use when the user asks to prepare, draft, open, update, review, deliver, or merge a pull request, or when project risk rules require a PR.
---

# Prepare a Pull Request

1. Read `.claude/git-guidelines.md` and use a PR for its listed high-risk or isolation-worthy changes. Inspect `.github/pull_request_template.md` when it exists.
2. Inspect the current branch, upstream, status, commits, and diff. Do not include unrelated working-tree changes in the PR summary.
3. Infer the base from branch ancestry rather than always choosing `main`. Honor an explicitly requested base.
4. Draft the title and body in English. Use `<type>: imperative description` for the title and follow the repository PR template when it exists.
5. Write for a human reviewer, not as an execution report:
   - Open with one or two short paragraphs explaining the context, why the change matters, and the resulting behavior. Prefer a natural narrative over separate `Purpose` and `User effect` sections.
   - Follow with a compact `What changed` list containing only the details that help someone understand the diff. Group related changes; do not mirror the file list.
   - Add `How to verify` only for code or behavior changes. Describe a short reviewer journey first, then mention meaningful automated checks without dumping routine command history.
   - Add `Notes` only when a reviewer must know about risk, migration, rollout, screenshots, tradeoffs, or follow-up work.
   - Keep paragraphs short, use plain language, and vary the structure when a tiny PR reads better without headings.
   - Omit internal agent process, exhaustive CI narration, sandbox limitations, empty sections, and claims that are obvious from the checks shown by GitHub.
   - Never describe a check as passed unless it actually passed. Mention a missing check only when that absence materially affects review or merge confidence.
6. Check that the branch is pushable and that proportional local checks have run. Report missing or failing checks accurately.
7. Draft only when the user asks for a draft. When asked to implement, finish, deliver, open, update, or merge, push and mutate the PR without asking again when target and base are unambiguous.
8. Monitor CI through completion. If delivery was requested, merge when green unless a major dependency, destructive migration, security ambiguity, or unresolved finding needs user judgment.
9. After merge, verify the resulting `main` CI and deployment signal when available. Do not comment, close without merge, or delete branches unless useful to the requested delivery workflow.
