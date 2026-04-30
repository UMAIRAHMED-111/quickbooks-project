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

### 6 — Claude Code workflow infrastructure (`claude-dev`)
- Full development lifecycle tooling added to `.claude/`:
  - 4 skills: `spec-creator`, `debug`, `refactor`, `frontend-development` (active; `spec-follower`, `split-pr`, `feature-request` removed)
  - 12 commands: `/standup`, `/estimate`, `/new-feature`, `/ship`, `/split-branches`, `/push-stack`, `/check-ci`, `/open-prs`, `/review`, `/docs-standards-review`, `/explain`, `/update-kb`
  - 7 knowledge files: `workflow.md`, `codebase.md`, `code-pointers.md`, `decisions.md`, `history.md`, `config.md`, `gatekeeping.md`
  - Hooks: PostToolUse auto-formats `.py` (ruff) and `.ts`/`.tsx` (prettier) with visible `systemMessage` output; Stop hook auto-validates build + tests
- React.lazy() added to `App.tsx` — page routes are now code-split, main bundle dropped from 776 kB to 289 kB
- Branch convention established: `feat/<feature>/<tier>` with all tiers targeting main independently

### 7 — CI branch filters + check-ci via GitHub MCP (`c753131`)
- `frontend-ci.yml` and `backend-ci.yml` workflows gained branch filters — CI now only triggers on relevant branch patterns, reducing noise
- `/check-ci` command refactored to use GitHub MCP (`mcp__github__*` tools) instead of `gh` CLI for CI status queries
- `push-stack.md` and `workflow.md` updated with detailed guidance on local-only dev branch handling (rebasing tier branches onto `claude-dev` tip before push)

### 8 — New commands: `/final-validation-pass`, `/test-case-create`, `/plan-mode`, `/spec-review` (`c0afd35`, `e40c965`)
- `/final-validation-pass` — critical pre-ship validation analysis; blocks shipping if any acceptance criteria gap is found
- `/test-case-create` — generates a comprehensive test case plan from a spec; saves to `.claude/specs/<name>-tests.md`
- `/plan-mode` — drops Claude into plan mode to review spec + codebase before writing code
- `/spec-review` — structured review of a spec file for completeness, ambiguity, and missing edge cases
- All existing command docs (`/standup`, `/estimate`, `/new-feature`, `/ship`, etc.) refactored for clarity and consistency

### 9 — Airflow DAG refactor: explicit ETL stages (`e4dd5c6`)
- `qbo_n8n_sync_dag.py` rebuilt with 6 explicit Airflow tasks:
  `fetch_n8n_json → extract_payload → transform_payload → validate_payload → load_warehouse → post_load_checks`
- Temp files passed between tasks for data integrity (each stage writes a JSON artifact; next stage consumes + deletes it)
- `fetch_webhook_to_tempfile()` added to `extract.py` — fetches n8n webhook and saves raw JSON to a temp path for Airflow XCom hand-off
- `post_load_checks` task queries `sync_runs` directly to validate status and counts are non-negative after every run
- Structured logging via `observability.py` at each stage

## Current Branch
`claude-dev` — active development branch. PRs target `main`. Local-only; never pushed to remote.
