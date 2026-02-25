# Global Command: Deploy

Use this command when a user asks to "deploy", "push to staging", or "release to production".

## Intent
- Deploy the current build to a target environment safely.
- Enforce pre-deploy gates and post-deploy health checks.

## Required Workflow
1. Confirm the target environment with the user (dev, test, stage, prod).
2. Run pre-deploy checks: tests, lint, type check, security audit.
3. Verify no uncommitted changes in the working tree.
4. Build deployment artifacts.
5. Execute the deployment to the target environment.
6. Run post-deploy health checks to verify the deployment succeeded.
7. Provide rollback instructions if the deployment fails.

## Guardrails
- Never deploy to production without explicit user confirmation.
- Require stage validation before production deployment.
- No secrets, credentials, or `.env` files in build artifacts.
- If pre-deploy checks fail, block the deployment and report failures.
- Do not skip health checks after deployment.

## Output Contract
- Target environment.
- Pre-deploy check results (pass/fail).
- Deployment status (success/failure).
- Health check result.
- Rollback instructions if applicable.
