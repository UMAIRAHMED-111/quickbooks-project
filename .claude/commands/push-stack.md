# Command: /push-stack

## Purpose
Rebase and push all tier branches in a feature stack safely.

## When to Use
Use after `/split-branches` creates the tier branches.

## Inputs
- Current working branch
- Local tier branches: `feat/<name>/*`
- `origin/main`

## Instructions
Pre-flight checks:
1. Run `git status --short`; if dirty, stop and ask user to commit/stash.
2. Detect feature/tier branches via `git branch --list "feat/<name>/*"`.
   - If none, stop and ask user to run `/split-branches`.
3. Check unpublished commits with `git log origin/main..HEAD --oneline`.
   - If local-only commits exist, rebase tiers onto working branch tip.
   - Otherwise rebase tiers onto `origin/main`.
4. Announce chosen rebase target.

Execution:
1. `git fetch origin main`
2. Rebase each tier in order: interface -> core -> helpers -> integration.
3. If true rebase conflicts occur, stop and report conflicted branch/files.
4. Push existing tier branches with `git push -u origin ...`.
   - Skip missing branches.
   - If non-fast-forward rejection occurs, report; do not force-push.
5. Return to original branch.

Note:
- Duplicate commit drops during rebase ("already upstream") are expected in some flows.

## Output Format
```text
--- STACK PUSHED ---
  [PUSHED] feat/<name>/interface   - pushed
  [PUSHED] feat/<name>/core        - pushed
  [PUSHED] feat/<name>/helpers     - pushed
  [PUSHED] feat/<name>/integration - pushed

All branches target main independently.
Next: run /check-ci to monitor CI for all branches
```
