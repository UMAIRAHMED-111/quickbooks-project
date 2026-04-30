# Command: /new-feature

## Purpose
Create a high-quality feature specification before implementation.

## When to Use
Use when a new feature request needs to be translated into a concrete, implementation-ready spec.

## Inputs
- Feature requirement from the user
- Architecture and conventions from `CLAUDE.md` and `.claude/knowledge/*`

## Instructions
You are a senior engineer assisting in a live development workflow.

Your role is NOT just to execute - you must:
- clarify ambiguity
- identify risks
- reason about tradeoffs
- ensure the solution fits the existing system

System context:
- QuickBooks ingestion pipeline
- Supabase (Postgres) database
- Flask backend
- LLM-powered query layer
- React frontend

1. Phase 1 - Clarify first (strict):

Read the feature requirement carefully.

If anything is ambiguous or underspecified:
- ask focused clarifying questions (max 5)
- prioritize questions that impact architecture, data model, or API design
- group questions if possible

Do NOT proceed until assumptions are clear.

2. Phase 2 - Impact analysis (before code reading):

Before jumping into files, think at system level:

- Which components are affected? (ingestion, DB, API, AI layer, frontend)
- What existing behavior could break?
- Does this introduce new edge cases or failure modes?

Call these out explicitly.

3. Phase 3 - Read relevant code:

Now identify and read only the most relevant files.

Use:
- `.claude/knowledge/code-pointers.md`
- `.claude/knowledge/codebase.md`

While reading:
- trace current data flow
- identify constraints and patterns already in use
- note edge cases already handled in code

Do NOT write the spec yet.

4. Phase 4 - Design before spec:

Before writing the spec, propose a short design:

- possible approaches (if more than one)
- tradeoffs (simplicity vs scalability, speed vs correctness, etc.)
- why you choose one approach

Keep this concise but explicit.

5. Phase 5 - Write the spec:

Save to: `.claude/specs/<kebab-feature-name>.md`

Use this exact format:

```markdown
# Feature: <Title>

**Status:** Draft  
**Created:** <today's date>

## Problem
<What is broken or missing? Why does this matter?>

## Goal
<One sentence: what success looks like when this is done.>

## Acceptance Criteria
- [ ] <specific, testable criterion>
- [ ] <specific, testable criterion>
- [ ] <specific, testable criterion>

## Technical Approach

### Files to change
- `path/to/file` - <what changes>

### New modules / migrations needed
- <list any, or "None">

### API contract (if applicable)
<Endpoint, method, request shape, response shape>

### Data model changes (if applicable)
<New columns or tables, or "None">

### AI / LLM considerations (if applicable)
- Prompt changes
- Validation / guardrails
- Failure handling

## Test Plan
- [ ] <unit or integration test to write>
- [ ] <edge case to cover>

## Risks & Edge Cases
- <explicit failure scenarios>
- <data inconsistencies>
- <LLM-specific risks if applicable>

## Out of Scope
- <what this deliberately does NOT do>
```

6. Phase 6 - Report back:

After saving the spec, output:

- Spec file path
- 3 bullet summary of what will be built
- Key risks (top 2 only)
- Estimated PR split:
  - interface
  - core
  - helpers
  - integration-tests
- Next step:

"Review .claude/specs/<name>.md, then say 'implement the spec' to begin."

## Output Format
Use the exact Phase 6 report-back structure above.