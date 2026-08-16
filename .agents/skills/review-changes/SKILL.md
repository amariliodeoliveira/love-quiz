---
name: review-changes
description: Review a local diff, commit range, or branch for correctness, regressions, security risks, missing tests, and violations of this repository's conventions. Use when the user asks for code review, a second pair of eyes, pre-commit review, diff review, or risk assessment of changes.
---

# Review Changes

1. Determine the target. Default to unstaged plus staged changes against `HEAD`; honor an explicit commit range or branch.
2. If the target is empty, say so and stop.
3. Read the project guidance relevant to changed files: always `.agents/references/engineering-guidelines.md`; add design, testing, database, and Git guidelines only when applicable.
4. Summarize the change's intent in one or two sentences from the diff and user request. Do not let assumed intent excuse incorrect behavior.
5. Review for correctness, edge cases, security, auth/session behavior, unsafe SQL, data loss, error and empty states, dead code, naming inconsistencies, and tests that are missing or do not prove their claim.
6. When subagents are permitted by the active session instructions, use one fresh context-free reviewer for a neutral pass. Give it only the target diff, the short intent summary, and applicable repository conventions. The reviewer must not edit files.
7. Verify each candidate finding against the actual code before reporting it. Discard speculative or unsupported findings.
8. Report findings first, ordered by severity, with `file:line`, the problem, impact, and a concrete remedy. Then note open questions and residual testing gaps. If there are no findings, say so explicitly and mention remaining risk.
9. Do not modify code for a review-only request. When review is part of an implementation or delivery task, resolve validated findings before committing and continue through the authorized delivery workflow.
