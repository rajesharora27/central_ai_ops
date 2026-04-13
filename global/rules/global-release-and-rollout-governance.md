# Global Release And Rollout Governance

## Purpose

AI changes should roll out with explicit blast-radius control. Governed repos must avoid shipping prompt/model/tool changes to all users at once without a release strategy, rollback path, or clear ownership.

## Core Requirements

1. User-facing AI changes should support staged rollout where the product architecture allows it.
2. High-risk AI changes should have a kill switch, fallback path, or rollback mechanism.
3. Release notes should mention meaningful prompt, model, provider, or tooling changes that alter user experience or risk.

## Rollout Expectations

Projects should prefer one or more of:

- feature flags
- staged environment promotion
- shadow mode or internal-only exposure
- cohort-based rollout
- runtime toggles for prompt/model selection

## Release Gate

Before release, confirm:

1. impacted evaluations and tests passed
2. observability is sufficient to monitor the rollout
3. rollback or disablement is practical if quality regresses
4. user-visible fallback behavior is acceptable if the AI subsystem degrades

## Guardrails

1. Do not silently swap prompt/model/provider behavior in production without traceability.
2. Do not launch a high-risk AI behavior without a plan for disabling it quickly.
3. If a project does not yet support staged rollout technically, document that gap explicitly as release risk.
