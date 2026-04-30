Sync all tier branches in the feature stack with remote main and push them.

## Pre-flight checks

### Check for uncommitted changes
Run `git status --short` on the current branch before doing anything.
If there are uncommitted changes: stop. Tell the user to commit or stash them first — checking out tier branches will fail otherwise.

### Detect the stack
Identify the feature name from the current branch (e.g. `feat/customer-aging/core` → feature is `customer-aging`).
If on a non-tier branch (e.g. `claude-dev`), infer the feature name from the most recent tier branch or ask the user.
Run: `git branch --list "feat/<name>/*"` to find all tier branches.

If no tier branches found: stop. Tell the user to run `/split-branches` first.

### Detect unpublished commits on the working branch
Run: `git log origin/main..HEAD --oneline`

- If the working branch has commits not yet in `origin/main` AND the working branch is local-only (never pushed, or pushed but diverged), **rebase tier branches onto the working branch tip** instead of `origin/main`. This ensures those commits are included in the published branches.
- If the working branch has no unpublished commits, rebase onto `origin/main` as normal.

Announce which rebase target will be used before proceeding.

## Sequence

### 1. Fetch
```
git fetch origin main
```

### 2. Rebase each tier branch onto the rebase target
For each tier branch in order (interface → core → helpers → integration):
```
git checkout feat/<name>/<tier>
git rebase <rebase-target>   # either origin/main or the local working branch tip
```

**Expected behavior:** if the tier branch's specific commit was already present in the rebase target (i.e. the work was committed to the dev branch before the split), git will silently drop that commit as a duplicate ("patch contents already upstream"). This is normal and correct for Option A pushes — the branch still ends up with all the right code.

If rebase produces a genuine conflict (not a duplicate drop): stop immediately.
Report which branch conflicted and which files need resolution.
Tell the user to resolve, then re-run `/push-stack`.

### 3. Push all branches
```
git push -u origin feat/<name>/interface
git push -u origin feat/<name>/core
git push -u origin feat/<name>/helpers
git push -u origin feat/<name>/integration
```
Skip any tier branch that does not exist locally.
If any push is rejected (non-fast-forward): report it. Do NOT force-push.

### 4. Return to original branch
```
git checkout <original-branch>
```

### 5. Report
```
--- STACK PUSHED ---
  ✅  feat/<name>/interface   — pushed
  ✅  feat/<name>/core        — pushed
  ✅  feat/<name>/helpers     — pushed
  ✅  feat/<name>/integration — pushed

All branches target main independently.
Next: run /check-ci to monitor CI for all branches
```
