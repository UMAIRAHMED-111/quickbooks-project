# Command: /split-branches

## Purpose
Split current work into tiered branches for stacked PR workflow.

## When to Use
Use after implementation is complete and a split plan is ready.

## Inputs
- Current diff: `git diff main...HEAD`
- Feature name from spec or current branch

## Instructions
1. Check whether splitting is needed:
   - If diff is already small (for example, fewer than 5 files and fewer than 200 lines), recommend not splitting.
   - Do not split just to hit a target number of branches.
2. Use naming convention `<type>/<feature-name>/<tier>`
   - `type`: `feat`, `fix`, `chore`, `refactor`
   - `tier`: `interface`, `core`, `helpers`, `integration`
3. Generate file-to-tier mapping from `git diff main...HEAD --stat` using this layer model:
   - `interface`: types, contracts, schemas, abstract classes, shared constants, `*.d.ts`, migration files
   - `core`: primary feature logic (routes, ETL/pipeline stages, SQL/business logic, key modules)
   - `helpers`: utilities, shared helpers, validators, formatters, reusable pure functions
   - `integration`: app wiring, integration glue, tests, docs updates
4. Apply split rules while mapping:
   - Keep each branch independently mergeable and non-breaking.
   - If files are tightly coupled, keep them together rather than forcing a split.
   - Put migration files in `interface` (or a dedicated early branch), never buried late.
   - Put integration tests in `integration`; unit tests can travel with the layer they validate.
   - For files that fit multiple layers, assign to the earliest layer they unblock and note the tradeoff.
5. Collapse trivial layers:
   - Omit any empty tier.
   - Merge tiny, tightly coupled tiers when separation reduces clarity.
6. Print mapping and ask for confirmation (`Proceed? y/n`).
7. Do not create branches until user confirms.
8. Save original branch:
   - `ORIGINAL=$(git branch --show-current)`
9. For each populated tier in order (interface -> core -> helpers -> integration):
   - Create branch from `main`.
   - Check out tier files from `$ORIGINAL`.
   - Commit with `feat(<name>): <tier> layer`.
10. Return to `$ORIGINAL`.

Before creating branches, print this reviewable split plan:

```text
Split plan: <N> branches

Branch 1 - <tier>:
  Files: <file list>
  What it does: <one sentence>
  Standalone mergeable: yes/no

Branch 2 - <tier>:
  Files: <file list>
  What it does: <one sentence>
  Depends on: <prior branch or none>

Merge order: interface -> core -> helpers -> integration
Notes: <awkward splits, cross-layer files, or "none">
```

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
