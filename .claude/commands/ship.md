You are running the pre-PR validation sequence. Execute every step regardless of failures. Collect pass/fail status for each. Print a full report at the end, then output the PR split plan.

## Sequence

### Step 1 — Change summary
Run: `git diff main...HEAD --stat`
Report: total files changed, insertions, deletions.

### Step 2 — Frontend validation (skip if no frontend files changed)
Detect: `git diff main...HEAD --name-only | grep "^quickbooks-dataengineering-frontend/"`
If frontend files changed:
- Run: `cd quickbooks-dataengineering-frontend && npx prettier --write "src/**/*.{ts,tsx}"`
- Run: `cd quickbooks-dataengineering-frontend && npx prettier --check "src/**/*.{ts,tsx}"`
- Run: `cd quickbooks-dataengineering-frontend && npm run build`
- Run: `cd quickbooks-dataengineering-frontend && npm run lint`
- Record: PASS or FAIL with any error summary (max 5 lines of output)

### Step 3 — Backend validation (skip if no backend files changed)
Detect: `git diff main...HEAD --name-only | grep "^quickbooks-dataengineering-pipeline/"`
If backend files changed:
- Run: `cd quickbooks-dataengineering-pipeline && ruff check --fix src/ tests/`
- Run: `cd quickbooks-dataengineering-pipeline && ruff format src/ tests/`
- Run: `cd quickbooks-dataengineering-pipeline && ruff check src/ tests/`
- Run: `cd quickbooks-dataengineering-pipeline && ruff format --check src/ tests/`
- Run: `cd quickbooks-dataengineering-pipeline && python -m pytest -q`
- Record: PASS or FAIL with test counts and any failure summary

### Step 4 — Docs review
Run `/docs-standards-review` on the changed files.
Record: issues found (list them) or "No issues".

### Step 5 — Code review
Run a `/review`-style structured review on the full diff (`git diff main...HEAD`).
Flag any CRITICAL or WARNING issues found.
Record: issue count and severity breakdown.

### Step 6 — Knowledge base update
Run `/update-kb` to refresh `.claude/knowledge/` with any new modules, routes, or patterns introduced by this change.
Record: which files were updated.

### Step 7 — PR split plan
Run the `split-pr` analysis on the current diff.
Output the full stacked PR plan.

## Final Report Format

```
╔══════════════════════════════════╗
║         SHIP REPORT              ║
╚══════════════════════════════════╝

Changes: <N files, +X -Y lines>

[ PASS / FAIL ] Frontend prettier
[ PASS / FAIL ] Frontend build
[ PASS / FAIL ] Frontend lint
[ PASS / FAIL ] Backend ruff
[ PASS / FAIL ] Backend tests  (<N passed, M failed>)
[ PASS / FAIL ] Docs review    (<N issues / clean>)
[ PASS / FAIL ] Code review    (<N critical, M warnings>)
[ DONE        ] Knowledge base updated

─────────────── PR Split Plan ───────────────
<split-pr output>
─────────────────────────────────────────────

Overall: READY TO SHIP / NEEDS FIXES BEFORE PR
```

Mark "READY TO SHIP" only if all checks pass and no CRITICAL code review issues exist.
Mark "NEEDS FIXES BEFORE PR" and list the blocking items if any check failed or CRITICAL issues were found.
