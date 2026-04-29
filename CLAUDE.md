# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

Two independent sub-projects in one repo:

- `quickbooks-dataengineering-frontend/` — React 19 + Vite dashboard
- `quickbooks-dataengineering-pipeline/` — Python 3.11 Flask API + ETL pipeline

---

## Commands

### Frontend (`quickbooks-dataengineering-frontend/`)

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # typecheck + production build
npm run lint       # ESLint (flat config)
npm run preview    # serve built dist
```

### Backend (`quickbooks-dataengineering-pipeline/`)

```bash
pip install -r requirements.txt
pip install -e ".[dev]"      # adds pytest
pip install -e ".[airflow]"  # adds Apache Airflow 3.x (optional)

python server.py              # Flask API at http://127.0.0.1:5050
python main.py                # one-shot ETL sync (CLI)
python main.py --local-file data/response.json  # sync from local file
python ask.py "question"      # natural-language warehouse Q&A (CLI)

python -m pytest -q           # run all tests
```

---

## Architecture

### Data Flow

```
QuickBooks (via n8n webhook)
  → extract.py  (HTTP fetch or local JSON)
  → transform.py (canonical rows)
  → validate.py  (field + business rules)
  → load.py      (transactional upsert by qbo_id to Postgres)
  ↓
Flask API  (web/app.py)
  ├── GET  /api/v1/metrics/*   → aggregated SQL → JSON for charts
  ├── POST /api/v1/sync        → async ETL trigger (202 Accepted)
  └── POST /api/v1/qa          → natural-language Q&A
  ↓
React Dashboard  (react-router-dom, 4 pages)
  ├── AppShell  (persistent nav, sync button, chat widget)
  ├── / HomePage → overview KPIs + nav tiles
  ├── /invoices, /customers, /trends → dedicated analytics pages
  ├── Recharts charts (pure-props, no fetch inside chart components)
  ├── TanStack Query hooks  (features/dashboard/hooks/useMetrics.ts)
  └── WarehouseChatWidget  (multi-turn Q&A panel, persists across pages)
```

### Backend Key Modules

| Path | Purpose |
|---|---|
| `src/qbo_pipeline/etl/pipeline.py` | Orchestrates extract → transform → validate → load; manages `sync_runs` lifecycle |
| `src/qbo_pipeline/web/app.py` | Flask routes, CORS, auth, background thread for async sync |
| `src/qbo_pipeline/warehouse/analytics_queries.py` | All metric SQL functions (one function per endpoint) |
| `src/qbo_pipeline/qa/warehouse_qa.py` | Q&A entry point; planner selects snapshot packs or dynamic SQL |
| `src/qbo_pipeline/db/pool.py` | `ThreadedConnectionPool` (max 15); shared across all Flask threads |
| `src/qbo_pipeline/config.py` | `Settings` and `WarehouseQaConfig` dataclasses built from env |
| `src/qbo_pipeline/observability.py` | Shared structured logger |

### Frontend Key Modules

| Path | Purpose |
|---|---|
| `src/App.tsx` | Router root — `BrowserRouter` + layout route + 4 page routes |
| `src/components/layout/AppShell.tsx` | Persistent shell: sticky header, top nav, sync button, chat widget, `<Outlet>` |
| `src/features/home/HomePage.tsx` | `/` — 6 KPI overview cards + 3 nav tiles |
| `src/features/invoices/InvoicesPage.tsx` | `/invoices` — 4 invoice charts |
| `src/features/customers/CustomersPage.tsx` | `/customers` — 4 customer charts + overdue table |
| `src/features/trends/TrendsPage.tsx` | `/trends` — payments by month + allocations summary |
| `src/features/dashboard/hooks/useMetrics.ts` | TanStack Query hooks, one per API endpoint |
| `src/features/dashboard/WarehouseChatWidget.tsx` | Floating AI Q&A panel — rendered in AppShell, persists across pages |
| `src/components/dashboard/` | Shared helpers: `ChartCard`, `KpiCard`, `KpiSkeleton`, `BlockError`, `ChartEmpty`, `SectionHeader`, `Stat` |
| `src/components/charts/` | Pure Recharts wrappers (receive data as props only) |
| `src/components/ui/` | shadcn/ui primitives — add new ones via `npx shadcn@latest add <component>` |
| `src/lib/api.ts` | Typed fetch helpers, `VITE_API_BASE_URL` config, error class |

### Database Schema (Supabase Postgres)

Core tables: `customers`, `invoices`, `payments`, `payment_invoice_allocations`, `sync_runs`. All ETL upserts key on `qbo_id` — reruns are safe. Run migrations in order from `supabase/migrations/`.

### Q&A Subsystem

Two modes (controlled by env flags):
- **Snapshot planner** (default): LLM picks a precomputed summary pack from `warehouse/sql_snapshot.py`
- **Dynamic SQL** (`WAREHOUSE_QA_DYNAMIC_SQL=1`): LLM proposes a SELECT; `qa/dynamic_sql.py` validates it (read-only AST, allowlisted tables, row cap) before execution

LLM routing: OpenAI primary → Gemini fallback (with 429 retry in `qa/gemini_retry.py`).

---

## Required Environment Variables

All three entry points load `.env` via `repo_bootstrap.py` on startup (does not override existing env).

### Backend

| Var | Notes |
|---|---|
| `DATABASE_URL` or `SUPABASE_DB_URL` | Postgres connection string (use pooler URL; encode `@` in password as `%40`) |
| `N8N_WEBHOOK_URL` | Returns `{ "customers": [], "invoices": [], "payments": [] }` |
| `OPENAI_API_KEY_1` | Primary LLM key |
| `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Fallback LLM key |

Optional: `SYNC_API_SECRET` (protects `POST /api/v1/sync`), `PORT` (default `5050`), `FLASK_DEBUG`, `WAREHOUSE_QA_DYNAMIC_SQL`, `OPENAI_MODEL`, `GEMINI_MODEL`.

### Frontend

| Var | Notes |
|---|---|
| `VITE_API_BASE_URL` | Flask origin, default `http://127.0.0.1:5050` |
| `VITE_SYNC_TOKEN` | Required only if backend sets `SYNC_API_SECRET` |

The Q&A call goes to the Flask backend — do not put LLM keys in the frontend.

---

## Frontend Conventions

- **Charts:** Recharts only; wrap in `src/components/charts/`. Chart components must be pure (data via props, no fetching inside).
- **UI primitives:** shadcn/ui only. New components via `npx shadcn@latest add`.
- **State:** TanStack Query for server state; no Redux/Zustand.
- **Styling:** Tailwind CSS 4. White page, black primary CTAs per design system.
- **Path alias:** `@/*` resolves to `src/*`.
