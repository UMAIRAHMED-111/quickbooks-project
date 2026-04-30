# Development Workflow

The full lifecycle for any change to this project, from first idea to merged PRs.

---

## Phase 0 — Session Start

Orient before writing any code.

| Command | What it does |
|---|---|
| `/standup` | Recent commits (3 days), open specs with criteria counts, uncommitted changes, suggested next step |
| `/estimate` | Scope a feature: blast radius, architecture risks, T-shirt size, PR split sketch |

---

## Phase 1 — Intake

Capture the requirement as a structured spec.

```
/new-feature "..."
```

- `spec-creator` skill formats the input into a spec document
- Spec saved to `.claude/specs/<kebab-name>.md`
- Contains: problem, goal, acceptance criteria, files to change, test plan, out-of-scope

Auto-trigger: saying "I want to build X" or "create a spec for" also activates `spec-creator`.

---

## Phase 2 — Planning

Review the spec in plan mode before writing any code.

- Claude reads the spec + relevant codebase sections
- Flags conflicts, gaps, missing dependencies, or ambiguous criteria
- Spec is updated and agreed on — this is the implementation contract

---

## Phase 3 — Implementation

Build against the spec. Criteria are checked off as work is completed.

**Auto-triggered skills:**
- `frontend-development` — triggered by any React/UI work
- `debug` — triggered by "fix this", "why is X broken", "getting an error"
- `refactor` — triggered by "clean this up", "simplify", "without changing behavior"

**Hooks (fire automatically, announce themselves):**
- `PostToolUse` on Write/Edit → `ruff format` on `.py`, `prettier` on `.ts`/`.tsx`; surfaces "ruff: formatted <file>" in the UI
- `Stop` → `npm run build && npm run lint` (if frontend changed), `python -m pytest -q` (if backend changed)

---

## Phase 4 — Iteration

Fix issues, improve quality, catch problems early.

| Tool | Trigger | What it does |
|---|---|---|
| `debug` skill | "debug this", "why is X broken", "fix this error" | Symptom → Hypothesis → Evidence → Root Cause → Fix. Never patches without diagnosing. |
| `refactor` skill | "clean this up", "simplify", "without changing behavior" | Behavior-preserving only. Tests must pass before and after. |
| `/review` | User-invoked | Structured code review on current diff |
| `/docs-standards-review` | User-invoked | Doc quality + coding standards checklist |

Run `/review` and `/docs-standards-review` during development, not just at the end.

---

## Phase 5 — Ship

Final gate before creating any branches or PRs. Run this once, fix everything it flags.

```
/ship
```

Runs in sequence regardless of failures, then reports a full pass/fail summary:

1. `git diff main...HEAD --stat` — change summary
2. `prettier --write + --check`, `npm run build`, `npm run lint` — frontend (skipped if no frontend changes)
3. `ruff check --fix + format + check + format --check`, `pytest -q` — backend (skipped if no backend changes)
4. `/docs-standards-review` — documentation and standards audit
5. `/review` on full diff — code review
6. `/update-kb` — refreshes `.claude/knowledge/` with new modules, routes, patterns
7. `split-pr` analysis — outputs the file-to-tier mapping for Phase 6

**Output:** `READY TO SHIP` or `NEEDS FIXES BEFORE PR` with a list of blocking items.

---

## Phase 6 — Split → Push → CI → PRs

Create independent branches per tier, push, wait for CI, open PRs — all targeting main.

### Branch Convention

```
feat/<feature-name>/<tier>
fix/<feature-name>/<tier>
chore/<feature-name>/<tier>
```

Tiers: `interface` · `core` · `helpers` · `integration`

Examples:
```
feat/customer-aging/interface
feat/customer-aging/core
feat/customer-aging/helpers
feat/customer-aging/integration
```

### Step 1 — `/split-branches`

Takes the split-pr output from `/ship` and creates one branch per tier from `main`:

- `interface` — type definitions, route/component signatures, API contracts, migrations
- `core` — main logic: ETL stages, SQL functions, Flask routes, React pages
- `helpers` — utilities, formatters, validators, shared hooks, config
- `integration` — wiring between layers, end-to-end connections, all test files

Prints the file-to-tier mapping and **waits for confirmation** before creating anything.
Uses `git checkout <original> -- <files>` to copy the right files onto each branch.
Omits tiers that have no files.

### Step 2 — `/push-stack`

Rebases all `feat/<name>/*` branches and pushes to remote. Fails loudly on conflicts or rejected pushes. Never force-pushes.

**Before running:** commit any pending changes on the working branch — uncommitted files block the branch checkouts.

**If the working branch is local-only (e.g. `claude-dev`) with unpublished commits:** `/push-stack` detects this and rebases tier branches onto the local branch tip instead of `origin/main`, so those commits are carried into the published branches. The local dev branch itself is not pushed.

**Duplicate-commit drops are expected:** if the tier branch's specific commit was already present on the dev branch (i.e. the work landed on `claude-dev` before `/split-branches` ran), git silently drops it during rebase. All 4 tier branches end up identical to the dev branch tip. This is Option A — the code is correct, each PR will show the full diff against main rather than a tier-scoped slice.

### Step 3 — `/check-ci`

Checks GitHub Actions for all tier branches simultaneously using `gh run list`.

```
feat/<name>/interface   ✅ Backend CI  ✅ Frontend CI
feat/<name>/core        ✅ Backend CI  ⏳ Frontend CI
feat/<name>/helpers     ❌ Backend CI  ✅ Frontend CI
feat/<name>/integration ⏳ queued

Overall: BLOCKED — fix failure on helpers first
```

On failure: fetches `gh run view --log-failed` and shows the failing step output.
Re-run until **READY FOR PRS**.

### Step 4 — `/open-prs`

Creates one PR per tier, all targeting `main`. Includes in each body:
- What this tier contributes (bullets)
- Stack table linking all 4 PRs
- Acceptance criteria this tier satisfies (from the spec)
- Link to `.claude/specs/<name>.md`

**Merge order:** interface → core → helpers → integration

---

## Tool Map

| Phase | Tool | Type | How it activates |
|---|---|---|---|
| 0 — Session start | `/standup` | Command | User-invoked |
| 0 — Session start | `/estimate` | Command | User-invoked |
| 1 — Intake | `/new-feature` | Command | User-invoked |
| 1 — Intake | `spec-creator` | Skill | Auto — "I want to build X", "create spec" |
| 2 — Planning | `/plan-mode` | Command | User-invoked — drops into plan mode to review spec |
| 2 — Planning | `/spec-review` | Command | User-invoked — structured spec completeness review |
| 3 — Implementation | `frontend-development` | Skill | Auto — any React/UI work |
| 3 — Implementation | PostToolUse hook | Hook | Auto — every Write/Edit |
| 3 — Implementation | Stop hook | Hook | Auto — every session stop |
| 4 — Iteration | `debug` | Skill | Auto — "fix this", "why is X broken" |
| 4 — Iteration | `refactor` | Skill | Auto — "clean this up", "simplify" |
| 4 — Iteration | `/review` | Command | User-invoked |
| 4 — Iteration | `/docs-standards-review` | Command | User-invoked |
| 4 — Iteration | `/test-case-create` | Command | User-invoked — generates test plan from spec |
| 5 — Ship | `/final-validation-pass` | Command | User-invoked — pre-ship criteria gap check |
| 5 — Ship | `/ship` | Command | User-invoked |
| 5 — Ship | `/update-kb` | Command | User-invoked / auto inside `/ship` |
| 6 — PR | `/split-branches` | Command | User-invoked |
| 6 — PR | `/push-stack` | Command | User-invoked |
| 6 — PR | `/check-ci` | Command | User-invoked (uses GitHub MCP) |
| 6 — PR | `/open-prs` | Command | User-invoked |
| Any | `/explain` | Command | User-invoked |

---

## Spec Format

```markdown
# Feature: <name>
## Problem
## Goal
## Acceptance Criteria
- [ ] criterion 1
- [ ] criterion 2
## Technical Approach
### Files to change
### New modules / migrations needed
## Test Plan
## Out of Scope
```

Specs live in `.claude/specs/`. They are committed alongside the code and linked from every PR.
`spec-follower` checks off criteria live during implementation.

---

## Hooks Reference

| Event | Matcher | Command | Visible output |
|---|---|---|---|
| PostToolUse | Write\|Edit | `ruff format <file>` on `.py` | "ruff: formatted <file>" |
| PostToolUse | Write\|Edit | `prettier --write <file>` on `.ts`/`.tsx` | "prettier: formatted <file>" |
| Stop | — | `npm run build && npm run lint` if frontend changed | build/lint output |
| Stop | — | `python -m pytest -q` if backend changed | test results |
