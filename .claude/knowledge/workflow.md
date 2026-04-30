# Development Workflow

The full lifecycle for any change to this project, from requirement to merged PR.

## 6-Phase Lifecycle

```
PHASE 1 — INTAKE
  User describes requirement
  → /new-feature command
  → spec-creator skill formats it
  → Spec saved to .claude/specs/<name>.md

PHASE 2 — PLANNING
  Review spec in plan mode
  → Claude reads spec + codebase
  → Identifies conflicts, gaps, missing dependencies
  → Spec updated before implementation begins

PHASE 3 — IMPLEMENTATION
  → spec-follower skill (reads .claude/specs/*.md, checks off criteria)
  → frontend-development skill (auto-triggered for UI work)
  → feature-request skill (auto-triggered for changes to existing code)
  → Hooks fire automatically: ruff/prettier on every save, validate on every stop

PHASE 4 — ITERATION
  Any issues during implementation:
  → debug skill        — root cause analysis (Symptom → Hypothesis → Evidence → Root Cause → Fix)
  → refactor skill     — behavior-preserving cleanup
  → /review command    — structured code review
  → /docs-standards-review command — doc and comment quality

PHASE 5 — SHIP
  → /ship command runs all checks and reports pass/fail:
    1. git diff summary
    2. npx prettier --write + --check, then npm run build && npm run lint  (frontend)
    3. python -m pytest -q           (backend)
    4. /docs-standards-review
    5. /review on full diff
    6. /update-kb
    7. split-pr plan output

PHASE 6 — PR
  → Create stacked PRs in the order from split-pr:
    Interface → Core → Helpers → Integration + Tests
  → Each PR description links back to the spec file
```

## Tool Map

| Phase | Tool | Type | Trigger |
|---|---|---|---|
| Intake | `/new-feature` | Command | User-invoked |
| Intake | `spec-creator` | Skill | Auto — "I want to build X" |
| Implementation | `spec-follower` | Skill | Auto — "implement the spec" |
| Implementation | `frontend-development` | Skill | Auto — any React/UI work |
| Implementation | `feature-request` | Skill | Auto — "add X to", "change this" |
| Iteration | `debug` | Skill | Auto — "fix this", "why is X broken" |
| Iteration | `refactor` | Skill | Auto — "clean this up", "simplify" |
| Iteration | `/review` | Command | User-invoked |
| Iteration | `/docs-standards-review` | Command | User-invoked |
| Ship | `/ship` | Command | User-invoked |
| Ship | `split-pr` | Skill | Auto — "split this PR" / runs inside /ship |
| Maintenance | `/update-kb` | Command | User-invoked / runs inside /ship |
| Maintenance | `/explain` | Command | User-invoked |

## Spec File Format

Specs live in `.claude/specs/`. Each file:
- Created by `/new-feature` or `spec-creator` skill
- Acceptance criteria tracked live (checked off during implementation by `spec-follower`)
- Linked from PR descriptions
- Committed to git alongside the code

## Hooks (Automatic)

These fire without user action:
- **PostToolUse (Write/Edit)**: `ruff format` on `.py`, `prettier` on `.ts`/`.tsx`
- **Stop**: `npm run build && npm run lint` (if frontend changed), `pytest` (if backend changed)
