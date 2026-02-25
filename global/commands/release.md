# Global Command: Release

Use this command when a user asks to "cut a release", "tag a version", or "prepare a release".

## Intent
- Produce a versioned, auditable release from the current branch.
- Ensure all quality gates pass before tagging.

## Required Workflow
1. Verify the working tree is clean (no uncommitted changes).
2. Run all quality gates: tests, lint, type check, security audit.
3. Determine the next version (semver) based on conventional commits or user input.
4. Update changelog with release notes.
5. Update version markers in documentation files (e.g., `CONTEXT.md`, `CONTRIBUTING.md`, `APPLICATION_BLUEPRINT.md`).
6. Create a version commit.
7. Tag the commit with the version.
8. Push the tag and commit only when the user explicitly requests it.

## Guardrails
- No release from a dirty working tree.
- All quality gates must pass before tagging.
- Do not skip changelog updates.
- Do not force-push tags unless explicitly requested.
- If any gate fails, report the failure and do not proceed with the release.

## Output Contract
- Version number.
- Tag name.
- Changelog entry summary.
- Quality gate results.
- Push status (if requested).
