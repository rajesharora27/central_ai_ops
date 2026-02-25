# Global Command: Test

Use this command when a user asks to "run tests", "test this", or "verify changes".

## Intent
- Run targeted tests for impacted modules to validate current changes.
- Avoid running the full suite unless explicitly requested.

## Required Workflow
1. Identify impacted modules from staged/unstaged changes.
2. Run unit tests for impacted modules first.
3. Run integration tests if changes cross module boundaries or touch resolvers/workflows.
4. Report results with pass/fail counts and failing test names.
5. If coverage tooling is available, report coverage delta for changed files.

## Guardrails
- Use a dedicated test database; never run tests against production.
- Do not modify test fixtures or snapshots without explicit approval.
- If tests cannot run (missing dependencies, broken config), report the gap explicitly.
- Do not skip failing tests to make the suite pass.

## Output Contract
- List of test suites run.
- Pass/fail/skip counts.
- Failing test names and error summaries.
- Coverage delta if available.
- Gaps reported if any tests could not run.
