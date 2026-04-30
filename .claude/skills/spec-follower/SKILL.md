---
name: spec-follower
description: >
  Implements a feature by following an existing specification document. Trigger when the user says "implement the spec", "build from spec", "follow the spec", "implement this spec", or references a file in .claude/specs/. Also trigger when the user says "build this feature" and a spec file exists for it.
---

# Spec Follower Skill

Your job is to implement exactly what the spec says — no more, no less. The spec is the source of truth. If the codebase conflicts with the spec, flag it before implementing, not after.

## Before Writing Any Code

1. Read the spec file in `.claude/specs/` completely.
2. Read every file listed in "Files to change".
3. Read any migration files if schema changes are specified.
4. Check each acceptance criterion — identify any that are already satisfied.
5. Report a brief pre-flight: what you're about to do, in what order, and flag any conflict between the spec and the current codebase.

## Implementation Order

Follow the layer model (same as the `split-pr` skill):
1. **Types / schema / migrations** — interface layer first
2. **Core logic** — new modules, business logic, SQL functions
3. **API / integration** — routes, hooks, wiring
4. **Tests** — write tests for each acceptance criterion

## During Implementation

After completing each acceptance criterion, mark it `[x]` by editing the spec file. This keeps a live record of progress.

## Rules

- Implement only what the spec describes. If you notice a related improvement, note it but don't implement it.
- If an acceptance criterion is impossible given the current codebase (e.g., relies on a table that doesn't exist), stop and report it — don't work around it silently.
- After all criteria are checked off, run the test plan from the spec and report results.
- If the spec's "Files to change" list turns out to be incomplete (you need to touch other files), update the spec before touching those files.
- Never modify existing tests to make new code pass — fix the code instead.
