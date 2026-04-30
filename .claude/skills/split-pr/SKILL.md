---
name: split-pr
description: >
  Analyzes the current branch diff and produces a stacked PR split plan whenever the user asks to split a PR, break up changes, or divide a large diff into reviewable chunks. Trigger when the user says things like "split this PR", "how should I break this up?", "this PR is too big", "help me stack these PRs", or "divide my changes into smaller PRs".
---

# Split PR Skill

Your job is to analyze the current branch's changes and produce a concrete, ordered split plan. The goal: each PR is independently reviewable, mergeable, and non-breaking.

## Layer model (apply in this order)

Use this stacking order as the default mental model — earlier layers are merged first:

1. **Interface** — types, contracts, schemas, abstract classes, shared constants. No implementation. Pure definitions that downstream layers depend on.
2. **Core integrations** — the primary feature logic: new modules, key functions, data pipelines, API routes. Depends on the interface layer.
3. **Helper methods** — utilities, shared helpers, formatters, validators that support the core. May be extracted from core if they're independently useful.
4. **Final integration + tests** — wires everything together, adds tests, updates docs, cleans up TODOs.

Not every PR needs all four layers. Collapse layers that are trivially small or tightly coupled. Never split just to hit a number.

## How to analyze

1. Run `git diff main...HEAD --stat` to get the file list.
2. Group files by layer using these signals:
   - **Interface**: `types.ts`, `models.py`, `schema.py`, `interfaces/`, `contracts/`, `*.d.ts`, migration files
   - **Core**: new route handlers, pipeline stages, main feature modules, primary business logic
   - **Helpers**: `utils/`, `helpers/`, validators, formatters, shared pure functions
   - **Tests + integration**: `*.test.*`, `*.spec.*`, `conftest.py`, updated `README`, docs, wiring in `App.tsx` / `app.py`
3. Flag any file that doesn't fit cleanly — note it and assign to the earliest layer it unblocks.

## Output format

Always produce this exact structure:

---

**Split plan: [N] PRs**

**PR 1 — [Layer name]: [one-line description]**
- Files: `path/to/file`, `path/to/file`
- What it does: [one sentence]
- Can merge standalone: yes / no — [reason if no]

**PR 2 — [Layer name]: [one-line description]**
- Files: `path/to/file`, `path/to/file`
- What it does: [one sentence]
- Depends on: PR 1

*(repeat for each PR)*

**Merge order:** PR 1 → PR 2 → PR 3 → PR 4

**Notes** *(optional)*
- [Flag any awkward splits, files that touch multiple layers, or suggested renames]

---

## Rules

- Keep each PR independently buildable and non-breaking — no PR should leave the codebase in a broken state at merge time.
- If a file is tightly coupled to another layer, keep them together rather than forcing an artificial split.
- Tests travel with the layer they test when possible; integration tests always go in the final PR.
- Migration files always go in their own PR or with the interface layer — never buried in a feature PR.
- If the diff is already small (<5 files, <200 lines), say so and recommend against splitting.
- Do not invent extra PRs to hit the four-layer model. Two clean PRs beats four awkward ones.
