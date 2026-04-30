# Command: /spec-review

## Purpose
Validate a newly created spec before any implementation starts.

## When to Use
Use immediately after `/new-feature` creates a spec in `.claude/specs/`.

## Inputs
- Spec path: `.claude/specs/<feature>.md`

## Instructions
- Start with this exact sentence:
  - "Before implementing, I'll validate the spec against the system."
- Review the spec critically for:
  - missing edge cases
  - incorrect assumptions about the current system
  - inconsistencies with existing schema or APIs
  - risks not captured
- Do **not** implement code in this phase.

## Output Format
```markdown
---

## Spec Review Findings
- **Missing edge cases:** <list or "None">
- **Incorrect assumptions:** <list or "None">
- **Schema/API inconsistencies:** <list or "None">
- **Uncaptured risks:** <list or "None">

## Recommendation
- **Ready to implement:** Yes/No
- **Required spec updates before implementation:** <explicit edits>

---
```
