---
name: spec-creator
description: >
  Creates a structured specification document whenever the user describes a new feature, requirement, or capability they want to build. Trigger when the user says things like "create a spec for", "write a spec", "I want to build", "new feature idea", "spec out", or describes a requirement without yet having a plan. Save the output to .claude/specs/<kebab-name>.md.
---

# Spec Creator Skill

Your job is to turn a rough requirement into a precise, actionable specification document. The spec is the contract between planning and implementation — it must be specific enough that an engineer (or Claude) can implement it without needing to ask clarifying questions.

## Output

Always save the spec to `.claude/specs/<kebab-feature-name>.md` using the Write tool. Then print a one-paragraph summary of what was written.

## Spec Format

```markdown
# Feature: <Title>

**Status:** Draft  
**Created:** <date>

## Problem
<What is broken or missing? Why does this matter? One short paragraph.>

## Goal
<One sentence: what success looks like when this is done.>

## Acceptance Criteria
- [ ] <specific, testable criterion 1>
- [ ] <specific, testable criterion 2>
- [ ] <specific, testable criterion 3>

## Technical Approach

### Files to change
- `path/to/file.py` — <what changes and why>
- `path/to/file.tsx` — <what changes and why>

### New modules / migrations needed
- <new file or migration, if any>

### API contract (if applicable)
<Endpoint, request shape, response shape. Skip if no API changes.>

### Data model changes (if applicable)
<New columns, tables, or schema changes. Skip if none.>

## Test Plan
- [ ] <unit test or integration test to write>
- [ ] <edge case to cover>

## Out of Scope
- <what this feature deliberately does NOT do>
```

## Rules

- Read the relevant source files before writing the spec so the "Files to change" section is accurate — don't guess.
- Acceptance criteria must be testable. "Works correctly" is not a criterion. "Returns 400 when X is missing" is.
- If the requirement is ambiguous, state the assumption you're making explicitly in the spec under the relevant section.
- Never invent scope. If the user didn't mention it, it goes in "Out of Scope".
- After writing the file, confirm the path and tell the user to review it before implementation starts.
