# Command: /update-kb

## Purpose
Refresh `.claude/knowledge/` files to match the current codebase.

## When to Use
Use after meaningful feature changes, architectural updates, or workflow/config updates.

## Inputs
- Current codebase files
- Recent git history
- CI/workflow configuration

## Instructions
1. Re-scan the real current state; do not invent information.
2. Verify facts from source files, git history, and CI configs only.
3. Target knowledge files:
   - `.claude/knowledge/history.md`
   - `.claude/knowledge/decisions.md`
   - `.claude/knowledge/codebase.md`
   - `.claude/knowledge/code-pointers.md`
   - `.claude/knowledge/gatekeeping.md`
   - `.claude/knowledge/config.md`
4. Gather evidence:
   - `git log --oneline -30`
   - Current source file inventory
   - Key architecture/config files (for example `CLAUDE.md`, backend app/config, frontend config, workflows)
5. Update stale/missing sections and preserve correct sections.
6. Reflect adds/removals/renames in modules, routes, env vars, and conventions.

## Output Format
```text
--- KB UPDATED ---
Updated files:
  - <knowledge file path>
  - <knowledge file path>

Changes made:
  - <what was stale and how it was corrected>
  - <new entries added>
  - <removed/renamed entries fixed>
```
