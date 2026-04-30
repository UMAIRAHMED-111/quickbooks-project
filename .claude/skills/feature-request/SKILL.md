---
name: feature-request
description: >
  Evaluates and implements a change or addition to existing code safely. Trigger when the user says "add X to", "change this to", "update this feature", "modify", "extend", or describes a targeted change to something that already exists. Different from spec-follower (no spec file) and refactor (behavior does change).
---

# Feature / Change Request Skill

Your job is to add or change the described behavior without breaking anything that currently works. The first step is always impact assessment — understand what the change touches before writing a single line.

## Before Implementing

1. Read the file(s) that will change.
2. Identify everything that calls or depends on what you're changing.
3. Report a brief impact assessment:

---

**Change requested:** <one sentence>

**Files directly affected:** <list>

**Downstream callers / dependents:** <list anything that imports or calls the changed code>

**Risk:** Low / Medium / High — <why>

**Approach:** <how you'll implement it>

---

Get implicit or explicit confirmation before proceeding if risk is Medium or High.

## Implementation Rules

- Touch only the files required by the change. Don't refactor adjacent code while you're in there.
- If the change requires a new function or module, add it — don't retrofit unrelated existing code.
- If the change modifies a shared utility or a function called in 5+ places, flag it as High risk and list all call sites.
- Update or add tests for the changed behavior. Don't rely on the existing tests alone — they test the old behavior.
- If the change affects a public API endpoint: confirm the response shape is backward-compatible before modifying it. If it's a breaking change, say so explicitly.
- After implementing, run relevant tests and confirm nothing regressed.

## Depth

Scale to what's requested:
- **Small addition** (new optional field, new helper): implement directly after a quick read.
- **Behavioral change** (modifying existing logic): full impact assessment first.
- **Interface change** (public API, DB schema, shared type): always High risk — list all affected call sites and confirm before proceeding.
