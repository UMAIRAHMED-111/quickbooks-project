# Code Pointers

Key locations to jump to for common tasks. Update this file when files move or new entry points are added.

## Adding a new API endpoint

1. Add SQL function to `quickbooks-dataengineering-pipeline/src/qbo_pipeline/warehouse/analytics_queries.py`
2. Add Flask route to `quickbooks-dataengineering-pipeline/src/qbo_pipeline/web/app.py`
3. Add TanStack Query hook to `quickbooks-dataengineering-frontend/src/features/dashboard/hooks/useMetrics.ts`
4. Add typed response shape to `quickbooks-dataengineering-frontend/src/types/metrics.ts`
5. Consume the hook in the relevant page component

## Adding a new dashboard page

1. Create page in `quickbooks-dataengineering-frontend/src/features/<name>/<Name>Page.tsx`
2. Register route in `quickbooks-dataengineering-frontend/src/App.tsx`
3. Add nav link in `quickbooks-dataengineering-frontend/src/components/layout/AppShell.tsx`

## Adding a new chart

1. Create pure component in `quickbooks-dataengineering-frontend/src/components/charts/<Name>Chart.tsx`
2. Must receive data as props — no fetching inside chart components
3. Use color palette from `quickbooks-dataengineering-frontend/src/lib/chart-theme.ts`

## Adding a new shadcn/ui component

```bash
cd quickbooks-dataengineering-frontend && npx shadcn@latest add <component>
```
Output goes to `src/components/ui/`.

## Changing ETL logic

- Extract: `quickbooks-dataengineering-pipeline/src/qbo_pipeline/etl/extract.py`
- Transform: `quickbooks-dataengineering-pipeline/src/qbo_pipeline/etl/transform.py`
- Validate: `quickbooks-dataengineering-pipeline/src/qbo_pipeline/etl/validate.py`
- Load (upsert): `quickbooks-dataengineering-pipeline/src/qbo_pipeline/etl/load.py`
- Orchestrator: `quickbooks-dataengineering-pipeline/src/qbo_pipeline/etl/pipeline.py`

## Changing the Q&A subsystem

- Entry point: `quickbooks-dataengineering-pipeline/src/qbo_pipeline/qa/warehouse_qa.py`
- Snapshot packs (default mode): `quickbooks-dataengineering-pipeline/src/qbo_pipeline/warehouse/sql_snapshot.py`
- Dynamic SQL validator: `quickbooks-dataengineering-pipeline/src/qbo_pipeline/qa/dynamic_sql.py`
- LLM routing: `quickbooks-dataengineering-pipeline/src/qbo_pipeline/qa/llm_complete.py` + `gemini_retry.py`

## Adding environment config

Backend: add to `Settings` or `WarehouseQaConfig` dataclass in `quickbooks-dataengineering-pipeline/src/qbo_pipeline/config.py`, then document in CLAUDE.md.

Frontend: prefix with `VITE_`, read via `import.meta.env.VITE_*`, document in CLAUDE.md.

## Running the dev stack

```bash
# Backend
cd quickbooks-dataengineering-pipeline && python server.py   # :5050

# Frontend
cd quickbooks-dataengineering-frontend && npm run dev        # :5173
```

## CI entry points

- `.github/workflows/frontend-ci.yml` — ESLint + Vite build (on frontend path changes)
- `.github/workflows/backend-ci.yml` — ruff + pytest with real Postgres (on backend path changes)
- `.github/workflows/merge-main.yml` — security audits + migration lint + prod build (on push to main)

## Creating stacked PR branches from a single working branch

Use `git checkout <source-branch> -- <files>` to copy specific files onto a new branch without cherry-picking commits:

```bash
# From each tier (starting on main each time):
git checkout main
git checkout -b feat/<name>/<tier>
git checkout <source-branch> -- file1 file2 dir/
git add .
git commit -m "feat(<name>): <tier> layer"
```

**Gotchas:**
- All changes on the source branch must be committed before switching — uncommitted changes block `git checkout`
- Deleted files are NOT carried over by `git checkout -- <files>`; handle them explicitly with `git rm <file>` after creating the branch
- Return to the original branch with `git checkout <source-branch>` when done
- Use `git branch --list "feat/<name>/*"` to verify all tiers were created

## Adding a lazy-loaded page route

When adding a new page to `App.tsx`, use `React.lazy()` to keep it out of the main bundle:

```tsx
const MyPage = lazy(() =>
  import("@/features/my-feature/MyPage").then((m) => ({ default: m.MyPage })),
);
```

Then render inside the existing `<Suspense fallback={null}>` wrapper in `App.tsx`.
The `.then((m) => ({ default: m.MyPage }))` re-export is required because pages use named exports, not default exports.
