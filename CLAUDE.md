# CLAUDE.md

This file gives you a full architectural picture of the project. Refer to `.claude/knowledge/` for deeper detail on any topic.

---

## What This Project Is

A QuickBooks Online (QBO) analytics platform. QBO accounting data (invoices, customers, payments) flows through an ETL pipeline into a Postgres warehouse, which is queried by a Flask API and visualized in a React dashboard. A natural-language Q&A widget lets users ask questions about the data in plain English.

---

## System Architecture

```
QuickBooks Online
  ↓  (n8n webhook — handles QBO OAuth, returns normalized JSON)
Python ETL Pipeline
  extract.py → transform.py → validate.py → load.py
  ↓  (upsert by qbo_id into Supabase Postgres)
Flask API  (server.py → web/app.py)
  ├── GET  /api/v1/metrics/*     → SQL aggregations → chart data
  ├── POST /api/v1/sync          → triggers ETL async (202, background thread)
  └── POST /api/v1/qa            → natural-language Q&A over the warehouse
  ↓
React Dashboard  (4 pages, react-router-dom)
  ├── AppShell — persistent layout: nav + sync button + chat widget
  ├── /            HomePage       — KPI overview cards + nav tiles
  ├── /invoices    InvoicesPage   — invoice analytics charts
  ├── /customers   CustomersPage  — customer analytics + overdue table
  └── /trends      TrendsPage     — payment trends + allocations
```

---

## Two Sub-Projects

| | Frontend | Backend |
|---|---|---|
| Path | `quickbooks-dataengineering-frontend/` | `quickbooks-dataengineering-pipeline/` |
| Stack | React 19, Vite, TanStack Query, Recharts, shadcn/ui, Tailwind CSS 4 | Python 3.11, Flask, psycopg2, OpenAI/Gemini |
| Dev | `npm run dev` → `:5173` | `python server.py` → `:5050` |
| Test | `npm run build && npm run lint` | `python -m pytest -q` |

They are independent — no shared build, no shared dependencies. The frontend calls the Flask API over HTTP.

**After every code change, verify:**
```bash
# Frontend
npx prettier --write "src/**/*.{ts,tsx}" && npx prettier --check "src/**/*.{ts,tsx}"
npm run build && npm run lint   # must pass clean — zero type errors, zero lint warnings

# Backend
python -m pytest -q             # must pass — tests run against real Postgres, not mocks
```

Full architecture rules and constraints that these checks enforce → `.claude/knowledge/gatekeeping.md`

---

## Backend: Key Modules

**ETL** (`src/qbo_pipeline/etl/`)
- `pipeline.py` — orchestrates the four stages and manages the `sync_runs` lifecycle
- `extract.py` — fetches from `N8N_WEBHOOK_URL` or a local JSON file
- `transform.py` — normalizes raw QBO payload into canonical row format
- `validate.py` — field-level and business rule checks
- `load.py` — transactional upserts keyed on `qbo_id`

**API** (`src/qbo_pipeline/web/app.py`)
- All Flask routes, CORS, auth middleware, and the background sync thread
- Every route returns `{ "data": ..., "error": null }` on success or `{ "data": null, "error": "..." }` on failure

**Warehouse** (`src/qbo_pipeline/warehouse/`)
- `analytics_queries.py` — one SQL function per `/metrics/*` endpoint, no inline SQL in routes
- `sql_snapshot.py` — precomputed summary packs used by the Q&A planner

**Q&A** (`src/qbo_pipeline/qa/`)
- `warehouse_qa.py` — entry point; dispatches to snapshot planner (default) or dynamic SQL mode
- `dynamic_sql.py` — validates LLM-proposed SELECTs: read-only AST check, allowlisted tables, row cap
- `llm_complete.py` + `gemini_retry.py` — OpenAI primary, Gemini fallback with 429 retry

**Shared**
- `config.py` — `Settings` and `WarehouseQaConfig` dataclasses; all env access goes through here
- `db/pool.py` — `ThreadedConnectionPool` (max 15); the only place DB connections are created
- `observability.py` — structured logger used everywhere; no `print()` in production paths
- `repo_bootstrap.py` — loads `.env` and patches `sys.path`; called first in every entry point

---

## Frontend: Key Modules

**Routing & Layout**
- `App.tsx` — `BrowserRouter` with a layout route wrapping all 4 page routes
- `components/layout/AppShell.tsx` — rendered once, never unmounts; owns the chat widget so conversation state survives page navigation

**Data Fetching**
- `features/dashboard/hooks/useMetrics.ts` — all TanStack Query hooks, one per API endpoint
- `lib/api.ts` — all `fetch` calls go through here; sets `VITE_API_BASE_URL` and the sync token header

**Components**
- `components/charts/` — pure Recharts wrappers; receive data as props, no fetching inside
- `components/dashboard/` — shared helpers: `ChartCard`, `KpiCard`, `KpiSkeleton`, `BlockError`, `ChartEmpty`
- `components/ui/` — shadcn/ui primitives (add via `npx shadcn@latest add <name>`)

**Types & Utilities**
- `types/metrics.ts` — all API response shapes
- `lib/format.ts`, `lib/parseAnswerBlocks.ts`, `lib/chart-theme.ts` — shared helpers

---

## Database

Tables: `customers`, `invoices`, `payments`, `payment_invoice_allocations`, `sync_runs`  
All hosted on Supabase Postgres. Migrations live in `supabase/migrations/` and run in order.  
Every ETL upsert keys on `qbo_id` — reruns are safe and idempotent by design.

---

## Non-Obvious Gotchas

Things that aren't visible from reading a single file and will cause bugs if missed:

- **`repo_bootstrap.py` before any import** — every entry point (`server.py`, `main.py`, `ask.py`) calls `configure_for_checkout()` before importing `qbo_pipeline`. Skip it and env + sys.path are unset.
- **`PORT` changes the host binding** — `server.py` binds `0.0.0.0` when `PORT` is set (cloud platforms), `127.0.0.1` otherwise. New entry points must replicate this logic.
- **Supabase pooler URL** — encode `@` in passwords as `%40` or the connection string parser silently breaks.
- **Dynamic SQL is opt-in and always gated** — `WAREHOUSE_QA_DYNAMIC_SQL=1` enables it, but every proposed SELECT still runs through `dynamic_sql.py` before execution. Never bypass the validator.
- **Tests use real Postgres, not mocks** — the CI spins up an actual Postgres service container. Mocking `psycopg2` will miss real SQL and schema bugs.
- **n8n webhook shape is a contract** — `N8N_WEBHOOK_URL` must return `{ "customers": [], "invoices": [], "payments": [] }`. If it changes, both `extract.py` and `transform.py` need updates.

---

## Environment Variables (Quick Reference)

Backend (via `.env` + `repo_bootstrap.py`): `DATABASE_URL` or `SUPABASE_DB_URL`, `N8N_WEBHOOK_URL`, `OPENAI_API_KEY_1`, `GEMINI_API_KEY` or `GOOGLE_API_KEY`. Optional: `SYNC_API_SECRET`, `PORT`, `FLASK_DEBUG`, `WAREHOUSE_QA_DYNAMIC_SQL`.

Frontend (Vite, prefix `VITE_`): `VITE_API_BASE_URL` (default `http://127.0.0.1:5050`), `VITE_SYNC_TOKEN` (only if `SYNC_API_SECRET` is set).

Full details → `.claude/knowledge/config.md`

---

## Development Workflow

Full lifecycle for every feature. Detailed map → `.claude/knowledge/workflow.md`

```
1. INTAKE      /new-feature → spec saved to .claude/specs/<name>.md
2. PLANNING    Plan mode → Claude reads spec + codebase, flags gaps
3. BUILD       spec-follower checks off criteria · frontend-development · feature-request
4. ITERATE     debug → refactor → /review → /docs-standards-review
5. SHIP        /ship → tests + lint + review + update-kb + PR split plan
6. PR          Stacked PRs: Interface → Core → Helpers → Integration+Tests
```

---

## Knowledge Base

`.claude/knowledge/` — detailed reference, updated with `/update-kb`.

| File | Contents |
|---|---|
| `workflow.md` | Full 6-phase development lifecycle and tool map |
| `history.md` | Project milestones and git history |
| `decisions.md` | Why architectural choices were made |
| `codebase.md` | Full directory tree and module map |
| `code-pointers.md` | Step-by-step guides for common tasks |
| `gatekeeping.md` | Full rules and constraints |
| `config.md` | All env vars, config files, CI workflows |

---

## Commands / Skills

| Type | Name | Trigger |
|---|---|---|
| Command | `/new-feature` | Start a feature — creates spec in `.claude/specs/` |
| Command | `/ship` | Pre-PR — runs all checks, outputs split plan |
| Command | `/review` | Structured code review |
| Command | `/docs-standards-review` | Documentation and coding standards review |
| Command | `/explain` | Code explanation |
| Command | `/update-kb` | Refresh `.claude/knowledge/` |
| Skill | `spec-creator` | Auto — "I want to build X", "create spec" |
| Skill | `spec-follower` | Auto — "implement the spec", references `.claude/specs/*.md` |
| Skill | `feature-request` | Auto — "add X to", "change this", "modify" |
| Skill | `debug` | Auto — "why is X broken", "fix this error" |
| Skill | `refactor` | Auto — "clean this up", "simplify" |
| Skill | `frontend-development` | Auto — any React/UI work |
| Skill | `split-pr` | Auto — "split this PR" / runs inside `/ship` |
