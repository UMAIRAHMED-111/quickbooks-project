# QuickBooks Analytics — Monorepo

End-to-end QuickBooks analytics platform. Two independent sub-projects that work together:

| Sub-project | Stack | Purpose |
|---|---|---|
| [`quickbooks-dataengineering-pipeline/`](./quickbooks-dataengineering-pipeline/) | Python 3.11 · Flask · Supabase Postgres | ETL pipeline, analytics API, warehouse Q&A |
| [`quickbooks-dataengineering-frontend/`](./quickbooks-dataengineering-frontend/) | React 19 · Vite · TypeScript · Recharts | Dashboard UI consuming the Flask API |

---

## How It Fits Together

```
QuickBooks → n8n webhook
  → Pipeline (extract → transform → validate → load → Postgres)
  → Flask API  http://127.0.0.1:5050
  → React Dashboard  http://localhost:5173
```

The frontend talks exclusively to the Flask API. LLM keys (OpenAI, Gemini) live in the backend `.env` only.

---

## Quick Start

**Backend**
```bash
cd quickbooks-dataengineering-pipeline
pip install -r requirements.txt
# copy .env.example → .env and fill in DATABASE_URL, N8N_WEBHOOK_URL, LLM keys
python server.py          # API at http://127.0.0.1:5050
```

**Frontend** (separate terminal)
```bash
cd quickbooks-dataengineering-frontend
npm install
npm run dev               # Dashboard at http://localhost:5173
```

---

## Sub-project READMEs

Each directory has its own README with full setup, architecture, configuration, and API reference:

- [Pipeline README](./quickbooks-dataengineering-pipeline/README.md)
- [Frontend README](./quickbooks-dataengineering-frontend/README.md)

---

## Repo Layout

```
quickbooks-project/
├── quickbooks-dataengineering-pipeline/   # Python ETL + Flask API
│   ├── src/qbo_pipeline/                  # core package
│   ├── airflow/dags/                      # optional Airflow orchestration
│   ├── supabase/migrations/               # Postgres DDL
│   ├── tests/
│   ├── server.py                          # API entrypoint
│   ├── main.py                            # one-shot CLI sync
│   └── ask.py                             # natural-language Q&A CLI
└── quickbooks-dataengineering-frontend/   # React dashboard
    ├── src/features/dashboard/            # metric hooks + Q&A widget
    ├── src/components/charts/             # Recharts wrappers
    └── src/lib/api.ts                     # typed fetch helpers
```
