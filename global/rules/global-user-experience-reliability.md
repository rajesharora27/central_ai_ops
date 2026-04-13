# Global User Experience Reliability

## Purpose

Users experience reliability through the interface, not through internal implementation success. Governed repos should treat loading, retry, degraded-mode, and recovery behavior as part of the product contract.

## Core Requirements

1. User-facing flows should fail clearly and recover gracefully.
2. Loading, retry, and degraded-mode behavior should be intentional instead of accidental.
3. Cross-platform experiences should remain coherent enough that users are not stranded by inconsistent states.

## UX Reliability Expectations

Projects should define, when relevant:

- loading-state behavior
- retry and recovery actions
- degraded-mode messaging
- account/session escape hatches
- continuity expectations across web, mobile, admin, and automation surfaces

## Validation Expectations

1. Validate the real user journey when behavior changes, not only the backend path.
2. Prefer informative, user-safe fallback states over silent failure or hard dead ends.
3. If a feature is intentionally unavailable in one environment or platform, the product should communicate that clearly.

## Operational Guidance

1. Reliability fixes should reduce user confusion, not just technical error counts.
2. Keep user-visible status and recovery language consistent across providers, tiers, and surfaces.
3. If the product keeps a user operational during degraded conditions, that behavior should be documented and tested where practical.
