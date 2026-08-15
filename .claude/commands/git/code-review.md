---
description: Spawn a fresh, context-free agent to review your uncommitted/unpushed changes and report findings for you to act on
---

# code-review

This project has no reviewers other than you and Claude, and no PR flow — work lands via direct commits
to `main` (see `.claude/git-guidelines.md`). So there's no human to catch what you missed. This command
is that second pair of eyes: it hands the diff to a **neutral agent with no conversation context** — it
hasn't seen this chat, our back-and-forth, or the reasoning behind decisions — and asks it to find what a
fresh reader would flag. You decide what to act on; this command never edits anything itself.

## What counts as "the change"

Default to whatever isn't committed yet: `git diff` (unstaged) + `git diff --staged` combined against
`HEAD`. If the user names a different target (a commit range, a branch), diff that instead.

If there's nothing to diff, say so and stop — don't invent findings.

## The context blurb

Before spawning the agent, write a **1-2 sentence summary of what the change is trying to do and why**
(not how, not the alternatives considered, not the back-and-forth it took to get there) — the kind of
line that would go in a commit body or a PR description. This isn't a spec or a plan; it exists so the
agent can tell "this edge case is unhandled" from "this edge case is intentionally out of scope."

If the user gives this command an argument, treat that as the blurb. Otherwise write it yourself from
what was actually done in the diff — don't ask the user to write it, and don't pull it from earlier
conversation reasoning beyond "what changed and why" in its most compressed form.

## Running the review

1. Compute the diff and the list of changed files.
2. Spawn a single `general-purpose` agent (via the `Agent` tool) with a self-contained prompt that:
   - Includes the raw diff (or tells the agent to run `git diff`/`git diff --staged` itself against this
     repo — either is fine) plus the one-line context blurb, clearly labeled as the _only_ intent context
     it gets — no narrative beyond that line, no conversation history, no design rationale.
   - Asks it to review for: correctness bugs, missed edge cases, security issues (auth, session handling
     in `src/proxy.ts`/`withSession`, SQL in `src/lib/db.ts`), and violations of this repo's own
     conventions (`.claude/engineering-guidelines.md`, `.claude/testing-guidelines.md`,
     `.claude/database-guidelines.md` — e.g. missing tests for `src/lib/` logic, raw CSS where Tailwind
     utilities would do, destructive DB statements without a scoped `WHERE`).
   - Asks it to flag anything a second reviewer would normally catch: unhandled empty/error states,
     inconsistent naming, dead code left behind, a test that doesn't actually exercise the edge case it
     claims to.
   - Explicitly tells it: it is reviewing code, not intent — it should say what looks wrong or risky
     regardless of whether it can guess the goal, and should not assume the change is finished or correct
     just because it's staged.
3. The agent reports back a list of findings (file:line, what's wrong, why it matters). It does not fix
   anything.

## After the review

Read the findings and use your own judgment — this is a checklist to react to, not a gate to pass. For
each finding, either fix it, explain why it doesn't apply, or note it as a known tradeoff. Don't silently
ignore one.

## Do not

- Have the review agent (or yourself, in reaction to it) commit or push anything — that's still the
  user's call, and still goes through the plain `git add`/`git commit` commands per
  `.claude/git-guidelines.md`.
- Give the review agent anything beyond the diff and the one-line blurb — no conversation history, plan,
  or design rationale. It must judge the diff close to cold, the way an outside reviewer would.
- Skip the review just because the change feels small — the point is catching what _you_ didn't notice,
  and small changes hide bugs just as easily.
