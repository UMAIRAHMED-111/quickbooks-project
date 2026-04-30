Create PRs from all tier branches to main. All PRs target main independently.

## Pre-flight

**Verify CI is green:**
Run `gh run list --branch feat/<name>/<tier> --limit 3` for each tier branch.
If any branch has failing or in-progress CI: print the status and ask the user to confirm before continuing. Do not silently proceed.

## Find the spec
Check `.claude/specs/` for a spec file matching the current feature name.
Read it to extract: feature name, goal, and acceptance criteria.

## For each tier branch (interface → core → helpers → integration)

### 1. Build the PR title
Format: `feat(<name>): <tier> — <short description>`
Under 70 characters. Examples:
- `feat(customer-aging): interface — types and route contract`
- `feat(customer-aging): core — aging SQL + Flask endpoint`

### 2. Build the PR body

```markdown
## What this does
- <1–3 bullets specific to what this tier contributes>

## Stack
| Branch | PR | Status |
|---|---|---|
| `feat/<name>/interface` | #<pr> | ⏳ open |
| `feat/<name>/core`      | #<pr> | ⏳ open |
| `feat/<name>/helpers`   | #<pr> | ⏳ open |
| `feat/<name>/integration` | #<pr> | ⏳ open |

Merge order: interface → core → helpers → integration.

## Acceptance criteria
(criteria this tier satisfies)
- [ ] <criterion from spec>

## Spec
`.claude/specs/<name>.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Fill in PR numbers as each PR is created (update previous PRs' bodies if needed).

### 3. Create the PR
```
gh pr create \
  --base main \
  --head feat/<name>/<tier> \
  --title "<title>" \
  --body "$(cat <<'EOF'
<body>
EOF
)"
```

Repeat for each tier. Collect the PR URLs as you go.

## Final Report

```
--- PRs CREATED ---
  interface:   https://github.com/.../pull/42
  core:        https://github.com/.../pull/43
  helpers:     https://github.com/.../pull/44
  integration: https://github.com/.../pull/45

All PRs target main.
Merge order: interface → core → helpers → integration.
After each merge, GitHub will auto-update the remaining open PRs.
```
