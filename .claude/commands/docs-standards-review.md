# Command: /docs-standards-review

## Purpose
Review changed files for documentation quality and coding standards.

## When to Use
Use during validation before opening PRs, or when asked for standards/doc review.

## Inputs
- Recently changed files (default), or user-specified file set

## Instructions
- Be concise and actionable.
- Focus on correctness and clarity over style nits.
- Every warning/critical item must include a concrete fix.
- Keep report scannable in under 2 minutes.
- Align recommendations with conventions in `CLAUDE.md`.
- Default scope is recently changed files unless user asks for full repo.

## Output Format
```markdown
---

## Documentation & Standards Review Report
**Files Reviewed:** <list files>
**Date:** <today's date>

### Passing
- <brief bullet per item done well>

### Needs Improvement
- <issue + file/function reference + recommended fix>

### Missing / Critical
- <missing item + why it matters + what to add>

### Summary
<2-3 sentences: overall readiness + most important fix>

### Priority Action Items
1. <most critical fix>
2. <second most critical>
3. <third if applicable>

---
```
