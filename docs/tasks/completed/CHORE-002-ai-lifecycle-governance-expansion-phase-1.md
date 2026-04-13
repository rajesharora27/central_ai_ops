---
id: CHORE-002
title: "AI Lifecycle Governance Expansion Phase 1"
type: chore
status: done
priority: high
depends_on:
  - CHORE-001
plan: CHORE-002-ai-lifecycle-governance-expansion-phase-1.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-002: AI Lifecycle Governance Expansion Phase 1

## Objective

Add the first set of missing AI lifecycle governance rules so every governed repository inherits stronger controls for evaluation, provider portability, observability, rollout safety, and async/retry reliability.

## Impact

- Central governance will better cover the practical SDLC risks of AI apps, not just code quality and task tracking.
- Cross-agent environments will inherit the same baseline expectations for model operations, rollout control, and scale-ready background jobs.
- Future project repos will have clearer requirements before they ship new AI features.

## Files

- Existing files:
  - `global/global-MASTER.md`
  - `global/workflows/global-implementation-checklist.md`
  - `global/workflows/global-application-blueprint.md`
  - `global/commands/test.md`
  - `global/commands/deploy.md`
  - `README.md`
  - `ONBOARDING.md`
  - `CHANGELOG.md`
  - `scripts/verify_governance_integrity.sh`
- New files:
  - `global/rules/global-ai-evaluation-governance.md`
  - `global/rules/global-model-and-provider-governance.md`
  - `global/rules/global-ai-observability.md`
  - `global/rules/global-release-and-rollout-governance.md`
  - `global/rules/global-background-jobs-and-retries.md`
  - `docs/plans/CHORE-002-ai-lifecycle-governance-expansion-phase-1.md`
  - `docs/tasks/CHORE-002-ai-lifecycle-governance-expansion-phase-1.md`

## Acceptance Criteria

- [x] Phase 1 global governance rule files exist and are written at the same canonical level as the current rule set.
- [x] Master docs, onboarding docs, and shared workflows reference the new AI lifecycle controls.
- [x] Shared test/deploy command playbooks reflect the new expectations where relevant.
- [x] Governance integrity verification knows about the new rule files.
- [x] README documents the new governance in a way maintainers can scan quickly.

## Validation

- [x] `npm run tasks:sync`
- [x] `npm run verify:governance`
- [x] `git diff --check`
