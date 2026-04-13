---
id: CHORE-002
title: "AI Lifecycle Governance Expansion Phase 1"
type: chore
status: done
depends_on:
  - CHORE-001
blocks: []
created: 2026-04-13
updated: 2026-04-13
---

# Plan: AI Lifecycle Governance Expansion Phase 1

## Goal

Expand `central_ai_ops` with the highest-value missing governance rules for the AI software development lifecycle so they apply consistently across Cursor, Codex, Claude, Gemini, Copilot, and similar environments.

## Scope

- add canonical global rules for:
  - AI evaluation governance
  - model and provider governance
  - AI observability
  - release and rollout governance
  - background jobs and retry governance
- wire the new rules into the shared master docs, onboarding, workflow checklists, command playbooks, and integrity checks
- update the central README so maintainers can find the new governance quickly

## Target Files

- `global/global-MASTER.md`
- `global/rules/global-ai-evaluation-governance.md`
- `global/rules/global-model-and-provider-governance.md`
- `global/rules/global-ai-observability.md`
- `global/rules/global-release-and-rollout-governance.md`
- `global/rules/global-background-jobs-and-retries.md`
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
