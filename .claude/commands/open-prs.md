# Command: /open-prs

## Purpose
Create PRs for all tier branches targeting `main`.

## When to Use
Use after `/push-stack` and once CI is acceptable for each tier branch.

## Inputs
- Tier branches: `feat/<name>/<tier>`
- Spec file in `.claude/specs/`

## Instructions
1. Pre-flight:
   - Check CI per tier with `gh run list --branch feat/<name>/<tier> --limit 3`
   - If failing/in-progress checks exist, show status and request user confirmation before continuing
2. Read matching spec:
   - Extract feature name, goal, and acceptance criteria
3. For each tier in order (interface -> core -> helpers -> integration):
   - Build title: `feat(<name>): <tier> - <short description>` (under 70 chars).
   - Build PR body with:
     - What this does
     - Stack table
     - Acceptance criteria covered
     - Spec link/path
   - Create PR via `gh pr create --base main --head feat/<name>/<tier> ...`
4. Update stack references with PR numbers as PRs are created
5. Return all PR URLs

## Output Format
```text
--- PRs CREATED ---
  interface:   https://github.com/.../pull/42
  core:        https://github.com/.../pull/43
  helpers:     https://github.com/.../pull/44
  integration: https://github.com/.../pull/45

All PRs target main.
Merge order: interface -> core -> helpers -> integration.
After each merge, GitHub will auto-update the remaining open PRs.
```
