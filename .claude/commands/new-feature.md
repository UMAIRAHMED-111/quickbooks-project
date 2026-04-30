You are starting the development workflow for a new feature. Your job is to turn the user's requirement into a precise spec document and orient them for implementation.

## Steps

1. **Read the requirement** — the user's description is your input. If it's vague, ask one focused clarifying question before proceeding. Never ask more than one.

2. **Read relevant code** — before writing anything, identify and read the files most likely to be affected by this feature. Use the knowledge base at `.claude/knowledge/code-pointers.md` and `.claude/knowledge/codebase.md` to locate them. Do not write the spec until you've read the code.

3. **Write the spec** — save it to `.claude/specs/<kebab-feature-name>.md` using this exact format:

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
- `path/to/file` — <what changes>

### New modules / migrations needed
- <list any, or "None">

### API contract (if applicable)
<Endpoint, method, request shape, response shape>

### Data model changes (if applicable)
<New columns or tables, or "None">

## Test Plan
- [ ] <unit or integration test to write>
- [ ] <edge case to cover>

## Out of Scope
- <what this deliberately does NOT do>
```

4. **Report back** — after saving the spec, print:
   - The spec file path
   - A 3-bullet summary of what will be built
   - The estimated PR split (using the Interface → Core → Helpers → Tests layering from `split-pr`)
   - Next step: "Review `.claude/specs/<name>.md`, then say 'implement the spec' to begin."

## Rules

- Acceptance criteria must be testable. "Works correctly" is not acceptable. "Returns HTTP 400 when the customer_id is missing" is.
- If the feature requires a DB migration, note it explicitly in the spec — migrations are always their own PR.
- Do not begin implementation. This command produces a spec only.
- If a spec file for a similar feature already exists in `.claude/specs/`, read it first to avoid duplicate work.
