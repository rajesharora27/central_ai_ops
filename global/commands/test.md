# Global Command: Test

Use this command when a user asks to "run tests", "test this", or "verify changes".

## Intent

- Run the right validation for the impacted change.
- Prove the application still works from the user's perspective, not just from the implementation layer.

## Required Workflow

1. Identify impacted modules and affected user flows from the current change set.
2. Run unit tests for impacted modules first.
3. Run integration tests when changes cross module boundaries or touch resolvers, workflows, APIs, persistence, or third-party integrations.
4. For new features, add or update tests before treating the implementation as complete.
5. If applicable, run smoke or user-flow checks that verify the feature works end to end.
6. Report results with pass/fail counts and failing test names.
7. If coverage tooling is available, report coverage delta for changed files.

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
