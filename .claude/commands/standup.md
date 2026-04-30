Run the daily standup for this session. Read the codebase state and summarize it in under 60 seconds.

## Sequence

### 1. Recent activity
Run: `git log --oneline --since="3 days ago" --format="%h %s (%cr)"`
Group results by area: frontend, backend, infra/CI. If nothing in 3 days, extend to 7.

### 2. Current branch state
Run: `git status --short` and `git diff main...HEAD --stat`
Report: uncommitted changes and how many commits ahead of main.

### 3. Open specs
List all files in `.claude/specs/` (exclude `.gitkeep`).
For each spec: report its name and count how many `- [x]` vs `- [ ]` acceptance criteria it has.
If no specs: report "clean slate".

### 4. Suggested next steps
Based on open specs and recent activity:
- What's most ready to continue or implement next
- Any spec that looks stale or needs revision before implementation
- Whether the branch looks close to ship-ready (few uncommitted changes, criteria complete)

## Output Format

```
--- STANDUP ---
Branch: <name> | <N commits ahead of main> | <uncommitted: clean / N files>

Recent (3 days):
  Frontend: <short bullets or "no changes">
  Backend:  <short bullets or "no changes">
  Infra:    <short bullets or "no changes">

Open specs:
  <spec-name>.md — <X of N criteria complete>
  (none — clean slate)

Next:
  → <top suggestion>
  → <second suggestion if applicable>
```
