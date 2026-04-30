# Gatekeeping — Rules & Constraints

Rules that protect the project from regressions. These are non-negotiable unless explicitly overridden.

## Security

- `.env` must never be committed. Verify with `git status` before every commit.
- No API keys, credentials, or connection strings hardcoded anywhere in source.
- All secrets load from `.env` via `repo_bootstrap.py` at startup.
- Frontend must never reference LLM keys — all AI calls go through the Flask backend.
- `SYNC_API_SECRET` protects `POST /api/v1/sync` — if set, the header `X-Sync-Token` or `Authorization: Bearer` is required.

## Database

- All ETL upserts must key on `qbo_id`. No insert-only paths — reruns must be idempotent.
- All DB operations go through the shared pool in `db/pool.py`. No standalone `psycopg2.connect()`.
- Migrations are additive only (add columns/tables). Destructive changes (DROP, RENAME, ALTER TYPE) require explicit confirmation.
- New migrations go in `supabase/migrations/` named sequentially.
- The `merge-main` CI workflow will fail the build if `DROP TABLE`, `DROP COLUMN`, or `TRUNCATE` appear in a newly added migration.

## Backend code

- ETL must follow canonical order: `extract → transform → validate → load`. No skips, no reordering.
- Flask routes return `{ "data": ..., "error": null }` on success, `{ "data": null, "error": "..." }` on failure.
- All metric SQL goes in `analytics_queries.py` as standalone functions — no inline SQL in route handlers.
- New config values go through `Settings` or `WarehouseQaConfig` in `config.py`. No `os.environ.get()` scattered in business logic.
- All structured logging uses `observability.py`. No `print()` in production paths.
- Dynamic SQL queries must be validated by `qa/dynamic_sql.py` (read-only AST, allowlisted tables, row cap) before execution.

## Frontend code

- Chart components must be pure — data via props only. No fetching, no hooks that call the network inside charts.
- New UI primitives use shadcn/ui only, added via `npx shadcn@latest add`.
- Server state uses TanStack Query hooks in `useMetrics.ts`. No `useEffect` + `fetch` patterns.
- Cross-component UI state uses Zustand. No prop-drilling beyond one level for shared state.
- All fetch helpers go through `src/lib/api.ts`. No raw `fetch`/`axios` in components.
- New pages require a route in `App.tsx` and a nav link in `AppShell.tsx`.
- Every data-dependent view must handle all three states: loading, error, empty.
- Tailwind classes only — no inline `style={{}}` except for dynamic values Tailwind can't express.

## CI gates (enforced on every PR)

- `frontend-ci`: Prettier check on `src/**/*.{ts,tsx}` + ESLint zero warnings + TypeScript build must pass
- `backend-ci`: ruff check + ruff format --check + pytest must pass against real Postgres
- `merge-main`: npm audit (high/critical), pip-audit, migration lint, prod build artifact

## Commit hygiene

- Do not commit with `--no-verify` or skip hooks unless explicitly requested.
- No `TODO`, `FIXME`, or `HACK` comments left in changed files.
- New env vars must be documented in CLAUDE.md.
- New routes, modules, or key files must be reflected in CLAUDE.md architecture tables.
