---
name: prepare-commit
description: Inspect staged or working-tree changes, organize them into focused Conventional Commits, and deliver them under the repository's AI-first Git policy. Use when the user asks to prepare, plan, draft, perform, finish, or push commits, split changes into commits, or write commit messages in this repository.
---

# Prepare Commit

1. Read `.agents/references/git-guidelines.md` before proposing or performing Git actions.
2. Inspect `git status --short`, staged changes, unstaged changes, and untracked files. Never assume every dirty file belongs to the current task.
3. Default to staged changes when the user asks only for a message or plan. When asked to commit, finish, or deliver, stage only task-owned changes and execute the workflow without asking again.
4. Split unrelated concerns into separate commits. List the exact files or hunks belonging to each group; use patch staging when a file mixes concerns.
5. Use Conventional Commits in English: `<type>(optional-scope): imperative description`. Keep the subject at most 72 characters when practical. Explain why, not what, in an optional body.
6. Before committing, review the final staged diff and ensure it contains no secrets, generated debris, unrelated edits, or accidental destructive changes. Let the configured pre-commit hook run; never bypass it.
7. A request to implement, finish, or deliver authorizes focused commits and pushes to the current working branch under `.agents/references/git-guidelines.md`. Do not push directly to `main` unless the owner explicitly requests it or the Git policy's emergency exception applies. A request only to draft or plan does not mutate Git.
8. After pushing, monitor the CI that applies to the target branch through completion. If `main` fails, fix forward when clear and safe; otherwise revert. Audit the remote commit and remaining working tree after success.
9. Do not change Git author identity. Require explicit confirmation for force pushes, hard resets, history rewrites, or other destructive operations.
