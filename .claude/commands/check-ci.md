Check CI status for all branches in the current feature stack, or a single branch if specified.

## Usage
- No argument: checks all `feat/<current-feature>/*` branches in the stack
- With a branch name argument: checks only that branch

## Sequence

### 1. Identify branches to check
Derive the feature name from the current branch (strip the tier suffix if present).
Run: `git branch -r --list "origin/feat/<name>/*"` to list all remote tier branches.
If no stack branches found: fall back to checking the current branch only.

### 2. For each branch, find its open PR (if any)
Use the GitHub MCP tool `mcp__github__list_pull_requests` with:
- owner: `UMAIRAHMED-111`
- repo: `quickbooks-project`
- state: `open`
- head: `UMAIRAHMED-111:<branch-name>`

### 3. Evaluate CI status per branch

**If a PR exists** → use `mcp__github__get_pull_request_status` with the PR number.
The response contains a `statuses` array and a `state` field (`success`, `failure`, `pending`, `error`).
Map each status check's `context` and `state` to the output table.

**If no PR exists** → fall back to:
```
gh run list --branch <branch> --limit 5
```
Report based on the most recent run per workflow name.

### 4. Evaluate each status

- `success` → ✅
- `pending` / `in_progress` / `queued` → ⏳
- `failure` / `error` → ❌  fetch failure details: `gh run view <run-id> --log-failed` (last 30 lines)
- no runs at all → ⚠️ no CI data — workflows may not have triggered (check branch filter in .github/workflows/)

### 5. Output

```
--- CI STATUS ---

feat/<name>/interface   ✅ Backend CI  ✅ Frontend CI   (PR #N)
feat/<name>/core        ✅ Backend CI  ⏳ Frontend CI   (PR #N)
feat/<name>/helpers     ❌ Backend CI  ✅ Frontend CI   (PR #N)
feat/<name>/integration ⚠️ no CI data                  (no PR)

Overall: BLOCKED — fix failure on helpers before merging

--- Failure: feat/<name>/helpers / Backend CI ---
FAILED tests/test_validate.py::test_amount_required
AssertionError: expected ValidationError, got None
<last 30 lines of failing step output>
```

**Overall verdict:**
- **READY TO MERGE** — all PRs, all checks green
- **WAITING** — checks still running → re-run `/check-ci` in a few minutes
- **BLOCKED** — at least one failure → fix, push the affected branch, re-run `/check-ci`
- **NO CI DATA** — workflows haven't fired → verify branch filters in `.github/workflows/`, or open PRs to trigger the `pull_request` event
