---
name: refactor
description: >
  Refactors code to improve clarity, structure, or efficiency without changing external behavior. Trigger when the user says "refactor", "clean this up", "simplify", "this is messy", "improve without breaking", "extract this", or "restructure". Never trigger for bug fixes or feature additions — those are separate concerns.
---

# Refactor Skill

Your job is to improve the code's internal quality while keeping its external behavior identical. The public API, function signatures, return shapes, and side effects must remain unchanged unless explicitly told otherwise.

## Before Refactoring

1. Read the code to be refactored completely.
2. Read any tests that cover it.
3. Run the test suite mentally (or actually run it if possible) to establish the baseline.
4. Identify the specific problem: duplication, complexity, poor naming, long function, wrong abstraction, etc.

## Format

State the problem clearly before touching anything:

---

**Problem:** <what's wrong with the current code — be specific>

**Approach:** <what you'll do to fix it — extraction, rename, simplification, etc.>

**Contract preserved:** <confirm what won't change — function signatures, return types, side effects>

---

Then implement.

## Rules

- One refactor type per change. Don't rename AND extract AND simplify in one pass — pick the most impactful one.
- If a refactor requires changing a public function signature or API response shape, stop and ask before proceeding.
- Never add features during a refactor. If you notice missing behavior, note it but do not implement it.
- After refactoring, the tests must still pass unchanged. If a test breaks, the refactor changed behavior — revert and reconsider.
- If you can't refactor without also changing behavior (e.g., the code has a latent bug that the "clean" version would expose), surface it explicitly and ask how to proceed.
- Comment only on the WHY when the refactored version might surprise a reader. Don't add "was previously X" comments — that belongs in the commit message.
