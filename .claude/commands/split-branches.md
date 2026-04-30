# Command: /split-branches

## Purpose
Split current work into tiered branches for stacked PR workflow.

## When to Use
Use after implementation is complete and a split plan is ready.

## Inputs
- Current diff: `git diff main...HEAD`
- Feature name from spec or current branch

## Instructions
1. Use naming convention `<type>/<feature-name>/<tier>`
   - `type`: `feat`, `fix`, `chore`, `refactor`
   - `tier`: `interface`, `core`, `helpers`, `integration`
2. Generate file-to-tier mapping:
   - interface: types/contracts/signatures/migrations
   - core: business logic, ETL, SQL, routes, pages
   - helpers: utilities, validators, formatters, shared hooks/config
   - integration: wiring and tests
3. Print mapping and ask for confirmation (`Proceed? y/n`)
4. Do not create branches until user confirms.
5. Save original branch:
   - `ORIGINAL=$(git branch --show-current)`
6. For each populated tier in order (interface -> core -> helpers -> integration):
   - Create branch from `main`.
   - Check out tier files from `$ORIGINAL`.
   - Commit with `feat(<name>): <tier> layer`.
7. Return to `$ORIGINAL`

## Output Format
```text
--- BRANCHES CREATED ---
  feat/<name>/interface   - <N files>
  feat/<name>/core        - <N files>
  feat/<name>/helpers     - <N files>
  feat/<name>/integration - <N files>

Original branch: <name> (unchanged)
Next: run /push-stack to push all branches to remote
```
