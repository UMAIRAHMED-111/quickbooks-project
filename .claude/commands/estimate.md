Estimate the complexity and scope of a feature before implementation begins.

The user will provide either a feature description in plain English, or a path to a spec file in `.claude/specs/`.

## Sequence

### 1. Understand the request
Read the feature description or spec file. If it references specific files or modules, read those too. Cross-reference the architecture in `CLAUDE.md` to understand where this fits.

### 2. Map the blast radius
Identify every file that will need to change:
- **New files** — new routes, components, modules, migrations
- **Modified files** — extending existing behavior
- **Test files** — new tests or updates to existing ones

### 3. Flag risks
Identify anything that could block or complicate implementation:
- Missing packages (not in requirements.txt or package.json)
- Schema changes (migration needed + both frontend and backend affected)
- API contract changes (changes to response shape affect consumers)
- Touches a known gotcha from `CLAUDE.md` (repo_bootstrap, PORT binding, n8n shape, etc.)
- Cross-cutting concern (touches auth, DB pool, observability, config)

### 4. Size the work
Use T-shirt sizing:
- **S** — under 2 hours, 1–3 files, no migrations, self-contained
- **M** — 2–4 hours, 4–8 files, possibly one migration
- **L** — 4–8 hours, 8+ files or a schema change
- **XL** — 8+ hours, cross-cutting concern or multiple subsystems

### 5. Output the PR split
Sketch the stacked PR breakdown using the project's split-pr pattern:
- PR 1 — Interface (types, contracts, route signatures)
- PR 2 — Core (main logic, SQL, ETL stages)
- PR 3 — Helpers (utilities, formatters, validators)
- PR 4 — Integration + Tests (wiring, end-to-end, test coverage)

Omit any tier that has nothing to put in it.

## Output Format

```
--- ESTIMATE ---
Feature: <name or short description>

Size:     <S / M / L / XL>
Effort:   <time range>

Files:
  New:      <list or "none">
  Modified: <list>
  Tests:    <list>

Risks:
  ⚠️  <risk description>
  (none identified)

PR split:
  PR 1 — Interface:         <what goes here>
  PR 2 — Core:              <what goes here>
  PR 3 — Helpers:           <what goes here>
  PR 4 — Integration+Tests: <what goes here>

Confidence: <High / Medium / Low — and why if not High>
```
