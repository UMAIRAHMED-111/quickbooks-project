# Command: /plan-mode

## Purpose
Align on a small, ordered, verifiable execution plan before coding.

## When to Use
Use after `/spec-review` passes and before implementation begins.

## Inputs
- Spec file in `.claude/specs/<feature>.md`

## Instructions
- Start with this exact sentence:
  - "I'll quickly align on the execution plan before coding."
- Break implementation into ordered steps.
- For each step include:
  - what will be changed
  - dependencies
  - potential risks
- Keep steps small and verifiable.
- Do **not** write code in this phase.

## Output Format
```markdown
---

## Execution Plan
1. **Step:** <small, verifiable action>
   - **Changes:** <files/components/services touched>
   - **Dependencies:** <prerequisites, ordering, blockers>
   - **Risks:** <what might go wrong + mitigation>

2. **Step:** <small, verifiable action>
   - **Changes:** <...>
   - **Dependencies:** <...>
   - **Risks:** <...>

<!-- Repeat as needed -->

## Readiness Check
- **Open questions:** <list or "None">
- **Can implementation start now?:** Yes/No

---
```
