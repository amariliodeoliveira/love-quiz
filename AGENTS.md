<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project working agreements

- Preserve `.claude/`; it remains the compatibility layer for Claude.
- Before changing application code, read `.claude/engineering-guidelines.md`.
- For UI, styling, layout, typography, or UX copy work, also read `.claude/design-guidelines.md`.
- For tests or logic under `src/lib/`, also read `.claude/testing-guidelines.md` and follow its TDD rules.
- For database code, schema changes, SQL, or data operations, also read `.claude/database-guidelines.md`. Treat `.env.local` as production access and ask before destructive data changes.
- For Git history, commits, branches, pushes, or pull requests, read `.claude/git-guidelines.md`. This is an AI-first repository: when asked to implement, finish, or deliver a change, agents may create focused commits and push them under that policy without asking again.
- Use repository skills under `.agents/skills/` for reusable workflows. Prefer `$review-changes`, `$prepare-commit`, `$prepare-pr`, and `$write-a-skill` when their descriptions match the request.
- Keep changes scoped. Fix adjacent issues only when they are directly affected by the requested work.
- Respect the existing pre-commit gate (`lint-staged` runs ESLint fixes, Prettier, and TypeScript). Add tests and builds in proportion to risk, then monitor the GitHub Actions CI after every push. A red `main` becomes the highest-priority task: fix forward when clear and safe, otherwise revert the offending commit.
