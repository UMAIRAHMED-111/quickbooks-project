# Command: /review

## Purpose
Give a fast, useful, consistently formatted code review.

## When to Use
Use when reviewing snippets, diffs, or changed files for correctness, risks, and maintainability.

## Inputs
- Code snippet, file(s), or diff to review
- Optional depth request (quick vs thorough)

## Instructions
- Be concise. No padding and no long preambles.
- Keep `What it does` to one sentence.
- Do not list issues for the sake of listing issues; if clean, say so.
- Do not praise generic things or suggest rewrites unless something is actually wrong.
- Severity labels:
  - **CRITICAL** - bug, security hole, data loss risk, or likely production break
  - **WARNING** - code smell, logic issue, performance risk, or likely future bug
  - **NIT** - style, naming, or minor readability concern
- Scale depth to input size:
  - **Small (<30 lines):** quick scan; surface only important issues
  - **Medium (30-150 lines):** cover correctness, structure, notable issues
  - **Large (150+ lines) / "thorough":** include architecture, edge cases, security

## Output Format
```markdown
---

**What it does:** <one sentence>

**Overall:** <one sentence verdict, or "looks good">

**Issues**
- `[CRITICAL]` <description> - <why it matters + fix>
- `[WARNING]` <description> - <why it matters + fix>
- `[NIT]` <description> - <quick note>

**Suggestions** *(optional)*
- <brief improvement idea>

**Good** *(optional)*
- <noteworthy strength>

---
```
