# Codebase Shape

## Monorepo Layout

```
quickbooks-project/
├── quickbooks-dataengineering-frontend/   # React 19 + Vite dashboard
├── quickbooks-dataengineering-pipeline/   # Python 3.11 Flask API + ETL
├── supabase/migrations/                   # Ordered SQL migration files
├── .github/workflows/                     # CI: frontend-ci, backend-ci, merge-main
└── CLAUDE.md                              # Project-wide guidance (source of truth)
```

## Frontend Structure (`quickbooks-dataengineering-frontend/src/`)

```
App.tsx                          # BrowserRouter + layout route + 4 page routes
app/providers.tsx                # TanStack Query client + Sonner toasts
components/
  layout/AppShell.tsx            # Persistent shell — nav, sync, chat, <Outlet>
  charts/                        # Pure Recharts wrappers (data via props only)
  dashboard/                     # Shared helpers: ChartCard, KpiCard, BlockError, etc.
  ui/                            # shadcn/ui primitives
features/
  home/HomePage.tsx              # / — 6 KPI cards + 3 nav tiles
  invoices/InvoicesPage.tsx      # /invoices — 4 invoice charts
  customers/CustomersPage.tsx    # /customers — 4 customer charts + overdue table
  trends/TrendsPage.tsx          # /trends — payments by month + allocations
  dashboard/
    hooks/useMetrics.ts          # All TanStack Query hooks (one per endpoint)
    WarehouseChatWidget.tsx      # Floating multi-turn Q&A panel
    components/StructuredAnswer.tsx
lib/
  api.ts                         # Typed fetch helpers, VITE_API_BASE_URL, error class
  format.ts                      # Currency/date formatters
  parseAnswerBlocks.ts           # Parses structured Q&A response blocks
  chart-theme.ts                 # Shared Recharts color palette
  dashboard-styles.ts            # Shared Tailwind class strings
  errorCodes.ts                  # API error code constants
types/metrics.ts                 # Shared TypeScript types for all API responses
```

## Backend Structure (`quickbooks-dataengineering-pipeline/`)

```
server.py                        # Entry point — Flask app + host/port binding
main.py                          # CLI entry point — one-shot ETL sync
ask.py                           # CLI entry point — natural-language Q&A
repo_bootstrap.py                # Loads .env; adds src/ to sys.path

src/qbo_pipeline/
  config.py                      # Settings + WarehouseQaConfig dataclasses
  observability.py               # Shared structured logger
  db/pool.py                     # ThreadedConnectionPool (max 15 connections)
  etl/
    pipeline.py                  # Orchestrator: extract→transform→validate→load
    extract.py                   # HTTP fetch from n8n or local JSON file
    transform.py                 # Normalizes raw QBO payload to canonical rows
    validate.py                  # Field + business rule validation
    load.py                      # Transactional upsert by qbo_id to Postgres
    run.py                       # Thin wrapper used by CLI and Flask route
  web/app.py                     # Flask routes + CORS + auth + async sync thread
  warehouse/
    analytics_queries.py         # All metric SQL (one function per endpoint)
    sql_snapshot.py              # Precomputed summary packs for Q&A planner
  qa/
    warehouse_qa.py              # Q&A entry point — planner dispatch
    dynamic_sql.py               # Read-only AST validator + allowlisted-table check
    llm_complete.py              # LLM call abstraction (OpenAI primary)
    gemini_retry.py              # Gemini fallback with 429 retry
    answer_structure.py          # Structures raw LLM answer into typed blocks
    context_window.py            # Manages prompt context size
    small_talk.py                # Handles non-data Q&A (greetings, off-topic)

tests/                           # pytest — runs against real Postgres service container
```

## Data Flow

```
QBO → n8n webhook
  → extract.py   (HTTP or local file)
  → transform.py (canonical rows)
  → validate.py  (field + business rules)
  → load.py      (upsert by qbo_id)
  ↓
Postgres (Supabase)
  ↓
Flask API  /api/v1/metrics/* → JSON
  ↓
React Dashboard (TanStack Query hooks → charts)
```

## Database Tables

`customers`, `invoices`, `payments`, `payment_invoice_allocations`, `sync_runs`

All ETL upserts key on `qbo_id`. Migrations in `supabase/migrations/` (run in order).
