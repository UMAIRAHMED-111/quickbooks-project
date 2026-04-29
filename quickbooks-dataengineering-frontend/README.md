# QBO Analytics — Frontend

Internal QuickBooks warehouse dashboard: metrics from the Flask API (`/api/v1/metrics/*`), **Refresh data** (`POST /api/v1/sync`), and a **floating warehouse assistant** (bottom-right) that chats against `POST /api/v1/qa`. Built per [`FRONTEND.md`](./FRONTEND.md) with **Vite**, **React 19**, **TypeScript**, **shadcn/ui**, **TanStack Query**, **Recharts**, and **Sonner**.

## Prerequisites

- Node 20+ (tested with npm)
- Backend: `python server.py` (default `http://127.0.0.1:5050`)

## Setup

```bash
npm install
cp .env.example .env   # optional — defaults match local Flask
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Flask origin (default `http://127.0.0.1:5050`) |
| `VITE_SYNC_TOKEN` | If the server sets `SYNC_API_SECRET`, set the same value (sent as `X-Sync-Token` and `Authorization: Bearer`) |

Do **not** put `GEMINI_API_KEY` in the frontend; Q&A runs on the server only.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production bundle |
| `npm run preview` | Serve `dist/` |
| `npm run lint` | ESLint |

## Project layout (high level)

- `src/app/` — providers (`QueryClient`, toasts)
- `src/components/ui/` — shadcn primitives
- `src/components/charts/` — Recharts wrappers (no fetch)
- `src/components/layout/` — app shell
- `src/features/dashboard/` — dashboard page, warehouse Q&A, metric hooks
- `src/lib/` — `api.ts`, `chart-theme.ts`, formatters, error copy
- `src/types/metrics.ts` — API response shapes
