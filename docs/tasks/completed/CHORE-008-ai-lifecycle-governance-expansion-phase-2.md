---
id: CHORE-008
title: "AI Lifecycle Governance Expansion Phase 2"
type: chore
status: done
priority: high
depends_on:
  - CHORE-002
plan: CHORE-008-ai-lifecycle-governance-expansion-phase-2.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-008: AI Lifecycle Governance Expansion Phase 2

## Objective

Add the next set of missing AI lifecycle governance rules so every governed repository inherits stronger controls for safety, output contracts, provenance, context handling, and privacy-aware retention/deletion.

## Impact

- Central governance will better cover the trust, safety, and privacy expectations of AI products.
- Cross-agent environments will inherit the same baseline expectations for grounded outputs, memory hygiene, and sensitive-data handling.
- Future project repos will have clearer requirements before they ship user-facing AI experiences.

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
  - `global/rules/global-ai-safety-governance.md`
  - `global/rules/global-output-contracts.md`
  - `global/rules/global-data-provenance-and-rag.md`
  - `global/rules/global-memory-and-context-governance.md`
  - `global/rules/global-privacy-retention-and-deletion.md`
  - `docs/plans/CHORE-008-ai-lifecycle-governance-expansion-phase-2.md`
  - `docs/tasks/CHORE-008-ai-lifecycle-governance-expansion-phase-2.md`

## Acceptance Criteria

- [x] Phase 2 global governance rule files exist and are written at the same canonical level as the current rule set.
- [x] Master docs, onboarding docs, and shared workflows reference the new safety/trust/privacy controls.
- [x] Shared test/deploy command playbooks reflect the new expectations where relevant.
- [x] Governance integrity verification knows about the new rule files.
- [x] README documents the new governance in a way maintainers can scan quickly.

## Validation

- [x] `npm run tasks:sync`
- [x] `npm run verify:governance`
- [x] `git diff --check`
