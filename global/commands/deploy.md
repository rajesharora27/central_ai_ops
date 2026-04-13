# Global Command: Deploy

Use this command when a user asks to "deploy", "push to staging", or "release to production".

## Intent

- Deploy the current build to a target environment safely.
- Enforce pre-deploy validation and post-deploy health checks.

## Required Workflow

1. Confirm the target environment with the user (dev, test, stage, prod).
2. Identify the feature areas touched by the change and the relevant validation suites.
3. Run pre-deploy checks: impacted tests first, then project quality gates (lint, typecheck, build, security audit, AI evaluations where applicable, and any deploy-specific smoke checks).
4. For AI releases, confirm rollout controls, observability, safety posture, and fallback or kill-switch readiness before shipping.
5. If the change affects retrieval, memory, or retention-sensitive behavior, confirm those expectations were validated and documented before shipping.
6. If the change affects migrations, environment parity, or user-visible recovery behavior, confirm those expectations were validated and documented before shipping.
7. If any required validation fails, stop. Do not deploy.
8. Verify no unintended working-tree changes are about to ship.
9. Build deployment artifacts.
10. Execute the deployment to the target environment.
11. Run post-deploy health checks or smoke checks to verify the deployment succeeded.
12. Provide rollback instructions if the deployment fails.

## Guardrails

- Never deploy to production without explicit user confirmation.
- Require stage validation before production deployment.
- Deployment automation should be updated when a new feature area introduces required validation.
- No secrets, credentials, or `.env` files in build artifacts.
- If pre-deploy checks fail, block the deployment and report failures.
- Do not skip health checks after deployment.
- For AI changes, do not rely on model/provider changes alone as a rollout strategy; use explicit release controls when practical.
- For AI changes, do not treat unreviewed safety/privacy/provenance behavior as “good enough” to ship.
- Do not treat unreviewed migration, parity, performance/cost, or UX-reliability behavior as “good enough” to ship.

## Output Contract

- Target environment.
- Pre-deploy check results (pass/fail).
- Deployment status (success/failure).
- Health-check result.
- Rollout/fallback status for AI changes when applicable.
- Safety/privacy/provenance release status for AI changes when applicable.
- Migration/parity/performance/user-reliability release status when applicable.
- Rollback instructions if applicable.
