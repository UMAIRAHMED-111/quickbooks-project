# Config Files & Environment

## Environment Variables

### Backend (loaded by `repo_bootstrap.py` from `.env` at startup)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` or `SUPABASE_DB_URL` | Yes | Postgres connection string. Use pooler URL. Encode `@` in password as `%40`. |
| `N8N_WEBHOOK_URL` | Yes | Returns `{ "customers": [], "invoices": [], "payments": [] }` |
| `OPENAI_API_KEY_1` | Yes | Primary LLM key for Q&A |
| `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Yes | Fallback LLM key |
| `SYNC_API_SECRET` | Optional | If set, `POST /api/v1/sync` requires `X-Sync-Token` or `Authorization: Bearer` |
| `PORT` | Optional | Default `5050`. Setting this also switches host binding to `0.0.0.0`. |
| `FLASK_DEBUG` | Optional | `1`/`true`/`yes` enables Flask debug mode |
| `FLASK_HOST` | Optional | Override host binding explicitly |
| `WAREHOUSE_QA_DYNAMIC_SQL` | Optional | Set to `1` to enable dynamic SQL mode in Q&A |
| `OPENAI_MODEL` | Optional | Override default OpenAI model |
| `GEMINI_MODEL` | Optional | Override default Gemini model |

### Frontend (Vite — must be prefixed `VITE_`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | No | Flask origin. Default: `http://127.0.0.1:5050` |
| `VITE_SYNC_TOKEN` | Conditional | Required only if backend sets `SYNC_API_SECRET` |

## Key Config Files

| File | Purpose |
|---|---|
| `quickbooks-dataengineering-frontend/.env` | Frontend env vars (gitignored) |
| `quickbooks-dataengineering-frontend/.env.example` | Template for frontend env vars |
| `quickbooks-dataengineering-pipeline/.env` | Backend env vars (gitignored) |
| `quickbooks-dataengineering-frontend/vite.config.ts` | Vite dev server + path alias (`@/*` → `src/*`) |
| `quickbooks-dataengineering-frontend/tsconfig.app.json` | TypeScript config (ES2022, incremental builds) |
| `quickbooks-dataengineering-frontend/components.json` | shadcn/ui config — component output path, style, base color |
| `quickbooks-dataengineering-pipeline/src/qbo_pipeline/config.py` | `Settings` + `WarehouseQaConfig` dataclasses |
| `quickbooks-dataengineering-pipeline/repo_bootstrap.py` | Loads `.env`, adds `src/` to `sys.path` |
| `.claude/settings.local.json` | Claude Code project-level settings |

## CI Workflows (`.github/workflows/`)

| Workflow | Trigger | What it checks |
|---|---|---|
| `frontend-ci.yml` | Push/PR touching `quickbooks-dataengineering-frontend/**` | ESLint (zero warnings) + TypeScript + Vite build |
| `backend-ci.yml` | Push/PR touching `quickbooks-dataengineering-pipeline/**` | ruff lint + pytest (real Postgres service container) |
| `merge-main.yml` | Push to `main` | npm audit (high/critical), pip-audit, destructive-SQL migration lint, prod build artifact (retained 30 days) |

## Package Managers

- Frontend: `npm` (Node 20). Lock file: `package-lock.json`.
- Backend: `pip`. Dependency file: `requirements.txt`. Editable install: `pip install -e ".[dev]"` for pytest extras.
