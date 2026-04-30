# Command: /standup

## Purpose
Run a quick session standup from current repository state.

## When to Use
Use at session start or before choosing the next task.

## Inputs
- Current git repo state
- Specs in `.claude/specs/`

## Instructions
1. Recent activity:
   - Run `git log --oneline --since="3 days ago" --format="%h %s (%cr)"`
   - Group by frontend, backend, infra/CI
   - If no changes in 3 days, extend to 7 days
2. Branch state:
   - Run `git status --short`
   - Run `git diff main...HEAD --stat`
   - Report uncommitted changes and commits ahead of `main`
3. Open specs:
   - List files in `.claude/specs/` (exclude `.gitkeep`)
   - For each, count `- [x]` and `- [ ]` acceptance criteria
   - If none, report `clean slate`
4. Suggested next steps:
   - Identify most ready item to continue
   - Call out stale specs that need revision
   - Note if branch appears ship-ready

## Output Format
```text
--- STANDUP ---
Branch: <name> | <N commits ahead of main> | <uncommitted: clean / N files>

Recent (3 days):
  Frontend: <short bullets or "no changes">
  Backend:  <short bullets or "no changes">
  Infra:    <short bullets or "no changes">

Open specs:
  <spec-name>.md - <X of N criteria complete>
  (none - clean slate)

Next:
  - <top suggestion>
  - <second suggestion if applicable>
```
