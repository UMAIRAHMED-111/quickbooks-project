# Command: /estimate

## Purpose
Estimate feature scope, complexity, and implementation risk before coding.

## When to Use
Use before implementation starts, from either a feature description or spec file.

## Inputs
- Plain-English feature request, or `.claude/specs/<feature>.md`
- Referenced files/modules

## Instructions
1. Understand request:
   - Read request/spec and referenced files
   - Cross-check system context in `CLAUDE.md`
2. Map blast radius:
   - List new files, modified files, and test files
3. Flag risks:
   - Missing dependencies
   - Schema/migration impact
   - API contract changes
   - Known project gotchas from `CLAUDE.md`
   - Cross-cutting concerns (auth, DB pool, observability, config)
4. Size work (T-shirt):
   - **S:** <2 hours, 1-3 files, no migrations
   - **M:** 2-4 hours, 4-8 files, maybe one migration
   - **L:** 4-8 hours, 8+ files or schema change
   - **XL:** 8+ hours, multi-subsystem or cross-cutting work
5. Propose PR split:
   - Interface, Core, Helpers, Integration+Tests
   - Omit empty tiers

## Output Format
```text
--- ESTIMATE ---
Feature: <name or short description>

Size:     <S / M / L / XL>
Effort:   <time range>

Files:
  New:      <list or "none">
  Modified: <list>
  Tests:    <list>

Risks:
  - <risk description>
  (none identified)

PR split:
  PR 1 - Interface:         <what goes here>
  PR 2 - Core:              <what goes here>
  PR 3 - Helpers:           <what goes here>
  PR 4 - Integration+Tests: <what goes here>

Confidence: <High / Medium / Low - and why if not High>
```
