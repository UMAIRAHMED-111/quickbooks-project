# Architectural Decisions & Context

## Why n8n for QBO extraction
QBO's OAuth flow and API rate limits make direct polling complex. n8n handles the webhook/auth layer and returns a normalized `{ customers, invoices, payments }` payload. The pipeline just consumes that shape — it doesn't own QBO auth.

## Why Supabase Postgres (not a managed DWH)
The dataset is small (a single business's QBO data). A full DWH would be over-engineered. Supabase gives a managed Postgres with connection pooling via the pooler URL, which is what `db/pool.py` uses.

## Why upsert-on-qbo_id everywhere
ETL reruns must be idempotent. Using `qbo_id` as the upsert key means running the sync 10 times produces the same result as running it once. This was a deliberate choice to make the sync safe to re-trigger from the UI.

## Why two QA modes (snapshot vs dynamic SQL)
Dynamic SQL is powerful but risky — a bad LLM query could be slow or expose data. The snapshot planner is the safe default: the LLM picks from precomputed packs in `sql_snapshot.py`. Dynamic SQL (`WAREHOUSE_QA_DYNAMIC_SQL=1`) is opt-in and gated behind a read-only AST validator + allowlist in `qa/dynamic_sql.py`.

## Why OpenAI primary + Gemini fallback
Single LLM dependency is a reliability risk. The fallback is handled transparently in `qa/gemini_retry.py` — callers don't know which provider responded.

## Why TanStack Query (not SWR or raw useEffect)
TanStack Query was already in the initial scaffold. It handles caching, background refetch, and loading/error states cleanly, which matched the dashboard's polling needs. SWR would have worked too — TQ was the first choice and there's no reason to migrate.

## Why AppShell renders the chat widget (not individual pages)
The chat widget maintains multi-turn conversation state. If it lived inside a page component, navigating away would unmount it and lose history. Lifting it to `AppShell` (which never unmounts) preserves the conversation across all 4 routes.

## Why 0.0.0.0 only when PORT is set
Binding to `0.0.0.0` locally is a minor security concern (exposes the API on all network interfaces). Cloud platforms like Render require it because they proxy traffic and set `PORT`. The `if os.getenv("PORT")` check means the behavior is correct in both environments without manual configuration.

## Why CI runs pytest against a real Postgres container (not mocks)
A real DB was chosen after mock tests passed but prod migration failures went undetected. The backend CI uses a Postgres service container to catch schema/SQL issues early.

## Why the frontend has a `lib/api.ts` abstraction
All fetch calls are centralized so the base URL (`VITE_API_BASE_URL`) is set in one place, error handling is consistent, and the sync token header is applied uniformly. Raw `fetch` in components would scatter these concerns.
