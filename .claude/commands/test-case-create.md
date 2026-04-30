# Command: /test-case-create

## Purpose
Create a complete, spec-driven test case plan before or during implementation.

## When to Use
Use after a spec is drafted or updated, and before final implementation sign-off.

## Inputs
- Spec file path: `.claude/specs/<feature>.md`
- Optional scope: frontend, backend, integration, or full stack

## Instructions
1. Phase 6 - Test coverage:
   - Write tests directly from the spec.
2. Extract acceptance criteria:
   - Read all criteria from the spec.
   - Create at least one test case per criterion.
3. Add edge case coverage:
   - Identify boundary, null/empty, and unusual-but-valid inputs.
   - Add tests for each meaningful edge case.
4. Add failure scenario coverage:
   - Identify invalid inputs, dependency failures, API errors, and data integrity failures.
   - Add expected error behavior for each failure scenario.
5. Map test levels:
   - Unit: pure logic and validation.
   - Integration: module and API interactions.
   - End-to-end (if applicable): user-visible workflows.
6. Validate completeness:
   - Ensure every acceptance criterion is covered.
   - Ensure at least one edge or failure test exists for each critical flow.
7. Do not implement code unless explicitly asked:
   - This command produces a test case plan and traceability map.

## Output Format
```markdown
--- TEST CASE PLAN ---
Spec: `.claude/specs/<feature>.md`

## Acceptance Criteria Coverage
- AC-1: <criterion text>
  - Test ID: TC-AC-1
  - Level: Unit/Integration/E2E
  - Scenario: <what is tested>
  - Expected: <expected behavior>

- AC-2: <criterion text>
  - Test ID: TC-AC-2
  - Level: Unit/Integration/E2E
  - Scenario: <what is tested>
  - Expected: <expected behavior>

## Edge Cases
- Test ID: TC-EDGE-1
  - Scenario: <boundary/empty/null/unusual valid input>
  - Expected: <expected behavior>

## Failure Scenarios
- Test ID: TC-FAIL-1
  - Scenario: <invalid input/dependency failure/API failure>
  - Expected: <error handling, status code, fallback, or message>

## Traceability Summary
- Acceptance criteria covered: <X>/<N>
- Edge case tests: <count>
- Failure scenario tests: <count>
- Coverage gaps: <list or "none">

Next step: Implement tests for the cases above, then run validation checks.
```
