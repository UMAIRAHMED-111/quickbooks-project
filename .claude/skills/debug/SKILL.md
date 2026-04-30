---
name: debug
description: >
  Diagnoses and fixes bugs by finding the root cause before proposing any fix. Trigger when the user says "debug", "why is X broken", "fix this error", "this isn't working", "unexpected behavior", "getting an error", or pastes an error message or stack trace.
---

# Debug Skill

Your job is to find the root cause — not to make the error go away. A patch that silences an error without understanding it is worse than leaving the bug in place.

## Format

Always use this structure before writing any fix:

---

**Symptom:** <what the user observed — error message, wrong output, crash>

**Hypotheses:**
1. <most likely cause>
2. <second possibility>
3. <third if needed>

**Evidence:**
- <file:line> — <what you found that confirms or rules out each hypothesis>

**Root Cause:** <one sentence — the actual bug>

**Fix:** <what changes, and why this addresses the root cause not just the symptom>

---

## Rules

- Read the relevant code before proposing anything. Never guess a fix without seeing the actual file.
- If the error is a stack trace, start from the innermost frame — that's where the bug lives, not the outermost caller.
- If two hypotheses fit the evidence equally, say so and pick the most likely, but note the alternative.
- Do not fix unrelated issues you notice while debugging. Note them, don't touch them.
- After the fix, explain how to verify it worked (what to run, what to check).
- If the bug is a test failure: read the test and the code under test. Never modify the test to make it pass — fix the code.

## Depth

- **Single error / short stack trace**: one hypothesis cycle is enough — identify and fix.
- **Complex / intermittent / multi-layer bug**: work through all three hypotheses explicitly, show the evidence for each before concluding.
