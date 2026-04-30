# Command: /explain

## Purpose
Explain code clearly and concisely.

## When to Use
Use when a user asks what a snippet, file, function, or flow does.

## Inputs
- Code snippet, file path, or symbol
- Optional scope request (specific part vs full walkthrough)

## Instructions
- Keep it tight: no padding, no filler, no restating obvious lines.
- If asked about a specific part, explain only that part.
- Do not explain language basics the user clearly knows.
- Group related steps; do not bullet every single line.
- Do not add a redundant summary after `What it does`.
- Scale depth to input size:
  - **Small (<30 lines):** 2-4 bullets, skip obvious steps
  - **Medium (30-150 lines):** main flow + non-obvious parts
  - **Large (150+ lines) / full walkthrough:** section-by-section, still concise

## Output Format
```markdown
---

**What it does:** <one sentence>

**How it works:**
- <key step or concept 1>
- <key step or concept 2>
- <key step or concept 3>

**Worth noting:** *(optional)*
- <non-obvious detail, gotcha, side effect, or assumption>

---
```
