---
id: CHORE-011
title: "Add Global Data Provenance And RAG Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-008
plan: CHORE-008-ai-lifecycle-governance-expansion-phase-2.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-011: Add Global Data Provenance And RAG Governance

## Objective

Create the canonical rule for source provenance, retrieval boundaries, freshness, and grounded AI outputs.

## Impact

- Governed repos will have clearer expectations for what AI is allowed to know, cite, and retrieve.
- Data trust and freshness will become auditable parts of the SDLC.

## Files

- New files:
  - `global/rules/global-data-provenance-and-rag.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/workflows/global-application-blueprint.md`

## Acceptance Criteria

- [ ] Provenance and RAG expectations are clearly documented.
- [ ] Shared docs reference the rule where AI data usage is described.
