You are updating the project knowledge base at `.claude/knowledge/`. Your job is to re-scan the actual current state of the codebase and rewrite any files that are stale or incomplete. Do not invent information — only write what you can verify from the files, git history, and CI config.

## Files to update

| File | What it captures |
|---|---|
| `.claude/knowledge/history.md` | Project history — key milestones from git log |
| `.claude/knowledge/decisions.md` | Why architectural choices were made |
| `.claude/knowledge/codebase.md` | Current directory tree, data flow, module purposes |
| `.claude/knowledge/code-pointers.md` | Where to go for common tasks |
| `.claude/knowledge/gatekeeping.md` | Rules and constraints that must not be violated |
| `.claude/knowledge/config.md` | Env vars, config files, CI workflows |

## Steps to follow

1. Run `git log --oneline -30` to capture recent history.
2. Run `find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" \) | grep -v node_modules | grep -v __pycache__ | grep -v dist | grep -v venv | sort` to get the current file list.
3. Read `CLAUDE.md`, `src/qbo_pipeline/config.py`, `src/qbo_pipeline/web/app.py`, `.github/workflows/*.yml`, `vite.config.ts`, and any other files needed to verify facts.
4. For each knowledge file, compare current content against what you observe. Rewrite the file if anything is stale, missing, or wrong. Preserve sections that are still accurate.
5. If new modules, routes, env vars, or conventions have been added since the last update, add them. If things have been removed or renamed, correct the entries.
6. Do not add speculative content — only document what actually exists in the code right now.
7. Report which files you updated and what changed.
