# Project History

## Origin
Started as a QuickBooks Online (QBO) data engineering pipeline to sync invoice, customer, and payment data from QBO (via n8n webhook) into a Postgres warehouse and expose it through a React dashboard.

## Milestone Timeline

### 1 — Initial scaffold (`47c6b61`)
- Frontend project created: React 19 + Vite + TanStack Query + shadcn/ui + Tailwind
- CLAUDE.md established as the single source of truth for project guidance
- `.env.example` introduced; `.gitignore` hardened to exclude secrets

### 2 — Root monorepo structure (`b06acb4`)
- Root `README.md` added to describe the two-sub-project layout
- `quickbooks-dataengineering-frontend/` and `quickbooks-dataengineering-pipeline/` formalized as independent sub-projects

### 3 — Multi-page frontend (`9ef6428`)
- Single-page monolith replaced with a routed 4-page app
- Pages: `/` (Home), `/invoices`, `/customers`, `/trends`
- `AppShell` introduced as a persistent layout — nav, sync button, chat widget survive across page navigations
- `react-router-dom` added; shared dashboard helpers extracted to `src/components/dashboard/`

### 4 — CI pipelines (`bd06f54`)
- Three GitHub Actions workflows added:
  - `frontend-ci.yml` — ESLint + TypeScript/Vite build
  - `backend-ci.yml` — ruff lint + pytest (real Postgres service container)
  - `merge-main.yml` — npm audit, pip-audit, destructive-SQL migration lint, prod build artifact
- Incremental TypeScript builds enabled (`ES2022` target)

### 5 — Host binding refactor (`e432a54`)
- `server.py` updated to bind `0.0.0.0` when `PORT` env var is set (cloud platforms like Render)
- Defaults to `127.0.0.1` for local runs — security improvement

## Current Branch
`claude-dev` — active development branch. PRs target `main`.
