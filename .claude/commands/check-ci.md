# Command: /check-ci

## Purpose
Check CI status across a feature stack or a single branch.

## When to Use
Use after pushing branches and while waiting for merge readiness.

## Inputs
- Optional branch name argument
- Current branch context (for deriving feature name)

## Instructions
1. Identify branches:
   - No arg: check all `origin/feat/<name>/*` branches
   - With arg: check only that branch
   - If no stack branches found, fall back to current branch
2. For each branch, find open PR:
   - Query open PR by head branch
3. Evaluate CI status:
   - If PR exists, inspect PR status checks
   - If no PR, run `gh run list --branch <branch> --limit 5`
4. Map status values:
   - success -> [PASS]
   - pending/in_progress/queued -> [PENDING]
   - failure/error -> [FAIL] (include failure snippet)
   - no runs -> [NO DATA]
5. Provide overall verdict:
   - READY TO MERGE / WAITING / BLOCKED / NO CI DATA

## Output Format
```text
--- CI STATUS ---

feat/<name>/interface   [PASS] Backend CI  [PASS] Frontend CI   (PR #N)
feat/<name>/core        [PASS] Backend CI  [PENDING] Frontend CI   (PR #N)
feat/<name>/helpers     [FAIL] Backend CI  [PASS] Frontend CI   (PR #N)
feat/<name>/integration [NO DATA] no CI data                    (no PR)

Overall: BLOCKED - fix failure on helpers before merging

--- Failure: feat/<name>/helpers / Backend CI ---
<last 30 lines of failing output>
```
