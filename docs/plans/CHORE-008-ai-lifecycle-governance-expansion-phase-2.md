---
id: CHORE-008
title: "AI Lifecycle Governance Expansion Phase 2"
type: chore
status: done
depends_on:
  - CHORE-002
blocks: []
created: 2026-04-13
updated: 2026-04-13
---

# Plan: AI Lifecycle Governance Expansion Phase 2

## Goal

Expand `central_ai_ops` with the next set of AI lifecycle governance rules so governed repos inherit stronger controls for safety, output consistency, grounded data usage, memory/context hygiene, and privacy-aware retention.

## Scope

- add canonical global rules for:
  - AI safety governance
  - output contracts
  - data provenance and RAG
  - memory and context governance
  - privacy, retention, and deletion
- wire the new rules into the shared master docs, onboarding docs, workflow checklists, command playbooks, and integrity checks
- update the central README so maintainers can find the full Phase 2 rule inventory quickly

## Target Files

- `global/global-MASTER.md`
- `global/rules/global-ai-safety-governance.md`
- `global/rules/global-output-contracts.md`
- `global/rules/global-data-provenance-and-rag.md`
- `global/rules/global-memory-and-context-governance.md`
- `global/rules/global-privacy-retention-and-deletion.md`
- `global/workflows/global-implementation-checklist.md`
- `global/workflows/global-application-blueprint.md`
- `global/commands/test.md`
- `global/commands/deploy.md`
- `README.md`
- `ONBOARDING.md`
- `CHANGELOG.md`
- `scripts/verify_governance_integrity.sh`

## Validation

- `npm run tasks:sync`
- `npm run verify:governance`
- `git diff --check`
