# Global Quality Gates

## Core Expectations

- Run relevant validation after code or configuration changes.
- Keep generated artifacts and temporary backups out of git history.
- Keep hooks and automation scripts non-interactive.
- Prefer stable, scriptable workflows over manual one-off steps.
- If tests cannot run, explicitly report the gap.

## Testing Requirements

1. Every new feature must add unit tests for the new logic or behavior.
2. Integration tests must be added or updated when behavior crosses module, API, workflow, resolver, or integration boundaries.
3. Bug fixes should add regression coverage whenever practical.
4. Validation should include the real user-facing flow when the change affects app behavior, not just low-level code paths.

## Deploy and Release Gates

1. Deployment scripts should run the relevant validation steps before shipping artifacts.
2. Do not deploy when required tests or quality checks fail.
3. The minimum check set should include the impacted test suites plus the project's normal lint/type/build/security gates.
4. If a project adds deploy automation for a new feature area, update the deploy path to validate that area before release.

## Code Health Expectations

1. Check for existing code or features first before adding new logic.
2. Prefer reuse and shared modules/services over duplicate implementations.
3. Keep code simple, readable, and formatted according to project conventions.
4. Remove or consolidate redundant logic when it is safe to do so as part of the change.
