---
name: write-a-skill
description: Create or update focused repository skills with valid metadata, progressive disclosure, and only the resources needed for repeatable workflows. Use when the user asks to create, convert, migrate, or improve a Codex skill or reusable agent workflow in this repository.
---

# Write a Skill

1. Clarify the workflow, triggers, expected output, and any unsafe or external actions. Infer these from existing artifacts when they are already clear.
2. Read the official `skill-creator` skill completely and follow its initialization, metadata, editing, and validation process.
3. Place repository-specific skills in `.agents/skills/<skill-name>/`. Use lowercase hyphen-case and keep the folder name equal to `name`.
4. Keep `SKILL.md` procedural and concise. Put detailed domain knowledge in `references/`, deterministic repeated operations in `scripts/`, and output templates in `assets/`.
5. Write a trigger-rich `description` that states what the skill does and when it should activate. Keep all trigger guidance in the description.
6. Generate `agents/openai.yaml` with the official generator. Include a short default prompt that explicitly mentions `$<skill-name>`.
7. Preserve product-specific source material unless the user asks to replace it. Adapt legacy-agent tools, permissions, and terminology to Codex instead of copying them blindly.
8. Run the official `quick_validate.py` against the completed skill and fix every validation error.
