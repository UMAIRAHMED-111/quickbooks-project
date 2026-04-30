Sync all tier branches in the feature stack with remote main and push them.

## Detect the stack
Identify the feature name from the current branch (e.g. `feat/customer-aging/core` → feature is `customer-aging`).
Run: `git branch --list "feat/<name>/*"` to find all tier branches.

If no tier branches found: stop. Tell the user to run `/split-branches` first.

## Sequence

### 1. Rebase each tier branch onto remote main
For each tier branch in order (interface → core → helpers → integration):
```
git checkout feat/<name>/<tier>
git fetch origin main
git rebase origin/main
```

If rebase produces a conflict on any branch: stop immediately.
Report which branch conflicted and which files need resolution.
Tell the user to resolve, then re-run `/push-stack`.

### 2. Push all branches
```
git push -u origin feat/<name>/interface
git push -u origin feat/<name>/core
git push -u origin feat/<name>/helpers
git push -u origin feat/<name>/integration
```
Skip any tier branch that does not exist locally.
If any push is rejected (non-fast-forward): report it. Do NOT force-push.

### 3. Return to original branch
```
git checkout <original-branch>
```

### 4. Report
```
--- STACK PUSHED ---
  ✅  feat/<name>/interface   — pushed
  ✅  feat/<name>/core        — pushed
  ✅  feat/<name>/helpers     — pushed
  ✅  feat/<name>/integration — pushed

All branches target main independently.
Next: run /check-ci to monitor CI for all branches
```
