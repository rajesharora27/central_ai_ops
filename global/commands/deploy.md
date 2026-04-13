# Global Command: Deploy

Use this command when a user asks to "deploy", "push to staging", or "release to production".

## Intent

- Deploy the current build to a target environment safely.
- Enforce pre-deploy validation and post-deploy health checks.

## Required Workflow

1. Confirm the target environment with the user (dev, test, stage, prod).
2. Identify the feature areas touched by the change and the relevant validation suites.
3. Run pre-deploy checks: impacted tests first, then project quality gates (lint, typecheck, build, security audit, and any deploy-specific smoke checks).
4. If any required validation fails, stop. Do not deploy.
5. Verify no unintended working-tree changes are about to ship.
6. Build deployment artifacts.
7. Execute the deployment to the target environment.
8. Run post-deploy health checks or smoke checks to verify the deployment succeeded.
9. Provide rollback instructions if the deployment fails.

## Guardrails

- Never deploy to production without explicit user confirmation.
- Require stage validation before production deployment.
- Deployment automation should be updated when a new feature area introduces required validation.
- No secrets, credentials, or `.env` files in build artifacts.
- If pre-deploy checks fail, block the deployment and report failures.
- Do not skip health checks after deployment.

## Output Contract

- Target environment.
- Pre-deploy check results (pass/fail).
- Deployment status (success/failure).
- Health-check result.
- Rollback instructions if applicable.
