# Command: /ship

## Purpose
Run the full pre-PR validation sequence and produce a ship/no-ship verdict.

## When to Use
Use before opening PRs.

## Inputs
- Current branch diff against `main`
- Project frontend/backend test and lint tooling

## Instructions
- Execute every step, even if earlier checks fail.
- Collect pass/fail per step and summarize blockers.

1. Change summary:
   - Run `git diff main...HEAD --stat`
2. Frontend validation (skip if no frontend changes):
   - Detect via `git diff main...HEAD --name-only | grep "^quickbooks-dataengineering-frontend/"`
   - Run prettier write/check, build, lint
3. Backend validation (skip if no backend changes):
   - Detect via `git diff main...HEAD --name-only | grep "^quickbooks-dataengineering-pipeline/"`
   - Run ruff check/fix, format, check, format --check, pytest
4. Docs review:
   - Run `/docs-standards-review` on changed files
5. Code review:
   - Run `/review` style scan over `git diff main...HEAD`
6. Knowledge base update:
   - Run `/update-kb` and record updated files
7. PR split plan:
   - Output stacked PR plan from current diff

- Mark `READY TO SHIP` only if all checks pass and no CRITICAL review issues exist.
- Otherwise mark `NEEDS FIXES BEFORE PR` and list blockers.

## Output Format
```text
--- SHIP REPORT ---

Changes: <N files, +X -Y lines>

[ PASS / FAIL ] Frontend prettier
[ PASS / FAIL ] Frontend build
[ PASS / FAIL ] Frontend lint
[ PASS / FAIL ] Backend ruff
[ PASS / FAIL ] Backend tests  (<N passed, M failed>)
[ PASS / FAIL ] Docs review    (<N issues / clean>)
[ PASS / FAIL ] Code review    (<N critical, M warnings>)
[ DONE        ] Knowledge base updated

--- PR Split Plan ---
<split-pr output>
---------------------

Overall: READY TO SHIP / NEEDS FIXES BEFORE PR
```
