# Command: /final-validation-pass

## Purpose
Run a critical final validation analysis before shipping.

## When to Use
Use after implementation and tests are complete, right before opening PRs or merging.

## Inputs
- Spec file path: `.claude/specs/<feature>.md`
- Implementation diff or changed files
- Test results (unit/integration/e2e, if available)

## Instructions
1. Start with this exact sentence:
   - "Before shipping, I'll do a quick validation pass."
2. Validate acceptance criteria:
   - Check whether implementation satisfies every criterion in the spec.
   - Mark each criterion as PASS, PARTIAL, or FAIL with evidence.
3. Validate edge case coverage:
   - Identify edge cases that are already covered.
   - Identify missing edge cases and their impact.
4. Analyze production break risks:
   - Identify what could break in production (runtime, data, integration, deployment, observability).
   - Call out likely failure points and blast radius.
5. Analyze performance risks:
   - Identify potential latency, query/load, memory, or scaling concerns.
   - Mark each as LOW, MEDIUM, or HIGH risk.
6. Be critical:
   - Do not assume behavior is correct without evidence.
   - Explicitly list blockers and non-blocking concerns.
7. Output only validation analysis:
   - Do not implement new code in this command.

## Output Format
```markdown
--- FINAL VALIDATION PASS ---
Spec: `.claude/specs/<feature>.md`

## Acceptance Criteria Validation
- AC-1: <criterion text> - PASS/PARTIAL/FAIL
  - Evidence: <test result, file behavior, or gap>
- AC-2: <criterion text> - PASS/PARTIAL/FAIL
  - Evidence: <test result, file behavior, or gap>

## Missing Edge Cases
- <edge case> - <impact if unhandled>
- <edge case> - <impact if unhandled>

## Production Break Risks
- Risk: <what could break>
  - Severity: LOW/MEDIUM/HIGH
  - Blast radius: <affected users/systems>
  - Mitigation: <recommended fix or guardrail>

## Performance Concerns
- Concern: <latency/query/memory/scaling issue>
  - Risk: LOW/MEDIUM/HIGH
  - Trigger condition: <when this appears>
  - Mitigation: <measurement or optimization action>

## Final Verdict
- Ship readiness: READY / NEEDS FIXES
- Blocking issues:
  - <blocker 1 or "none">
  - <blocker 2 or "none">
- Recommended next actions:
  1. <action>
  2. <action>
```
