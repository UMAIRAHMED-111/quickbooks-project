Check CI status for all branches in the current feature stack, or a single branch if specified.

## Usage
- No argument: checks all `feat/<current-feature>/*` branches in the stack
- With a branch name argument: checks only that branch

## Sequence

### 1. Identify branches to check
Derive the feature name from the current branch (strip the tier suffix if present).
Run: `git branch -r --list "origin/feat/<name>/*"` to list all remote tier branches.
If no stack branches found: fall back to checking the current branch only.

### 2. For each branch, fetch recent runs
```
gh run list --branch <branch> --limit 3
```

### 3. Evaluate each branch

For each run:
- **queued / in_progress** → still running
- **success** → ✅
- **failure** → ❌ fetch failure details: `gh run view <run-id> --log-failed` (last 30 lines)
- **cancelled** → ⚠️

### 4. Output

```
--- CI STATUS ---

feat/<name>/interface   ✅ Backend CI  ✅ Frontend CI
feat/<name>/core        ✅ Backend CI  ⏳ Frontend CI (30s elapsed)
feat/<name>/helpers     ❌ Backend CI  ✅ Frontend CI
feat/<name>/integration ⏳ queued

Overall: BLOCKED — fix failure on helpers before opening PRs

--- Failure: feat/<name>/helpers / Backend CI ---
FAILED tests/test_validate.py::test_amount_required
AssertionError: expected ValidationError, got None
<last 30 lines of failing step output>
```

**Overall verdict:**
- **READY FOR PRS** — all branches, all checks green → run `/open-prs`
- **WAITING** — runs still in progress → re-run `/check-ci` in a few minutes
- **BLOCKED** — at least one failure → fix, push the affected branch, re-run `/check-ci`
