Create a separate git branch for each tier of the stacked PR plan.

## Branch Naming Convention

`<type>/<feature-name>/<tier>`

- **type** — `feat`, `fix`, `chore`, `refactor` (conventional commits style)
- **feature-name** — kebab-case, derived from the spec file name or current branch
- **tier** — `interface`, `core`, `helpers`, `integration`

Examples:
```
feat/customer-aging/interface
feat/customer-aging/core
feat/customer-aging/helpers
feat/customer-aging/integration
```

## Sequence

### 1. Run split-pr analysis
Analyze `git diff main...HEAD` to produce a file-to-tier mapping:

- **interface** — type definitions, route/component signatures, API contracts, migration files
- **core** — main logic: ETL stages, SQL functions, Flask routes, React pages
- **helpers** — utilities, formatters, validators, shared hooks, config changes
- **integration** — wiring between layers, end-to-end connections, all test files

### 2. Confirm the plan
Print the mapping before creating any branches. Wait for user confirmation:

```
Branch plan for feat/<name>:

  interface   → types/metrics.ts, web/app.py (route signatures only)
  core        → etl/load.py, warehouse/analytics_queries.py, pages/CustomersPage.tsx
  helpers     → lib/format.ts, validate.py
  integration → tests/test_load.py, tests/test_api.py, App.tsx (route wiring)

Proceed? (y/n)
```

Do not create any branches until the user confirms.

### 3. Record the current branch
```
ORIGINAL=$(git branch --show-current)
```

### 4. Create each tier branch
For each tier that has files assigned (in order: interface → core → helpers → integration):
```
git checkout main
git checkout -b feat/<name>/<tier>
git checkout $ORIGINAL -- <file1> <file2> ...
git add .
git commit -m "feat(<name>): <tier> layer"
```

Omit tiers with no files.

### 5. Return to original branch
```
git checkout $ORIGINAL
```

### 6. Report
```
--- BRANCHES CREATED ---
  feat/<name>/interface   — 3 files
  feat/<name>/core        — 5 files
  feat/<name>/helpers     — 2 files
  feat/<name>/integration — 4 files

Original branch: <name> (unchanged)

Next: run /push-stack to push all branches to remote
```
