# Global Schema And Migration Governance

## Purpose

Governed repos must evolve schema and persisted data safely. Database and state migrations should support compatibility, rollout safety, and recovery instead of assuming one-shot perfect execution.

## Core Requirements

1. Prefer backward-compatible migration patterns by default.
2. Treat schema changes as release events that need validation, not just implementation details.
3. Avoid irreversible or destructive migration behavior without explicit approval and recovery planning.

## Migration Expectations

Projects should define, when relevant:

- phased migration patterns
- compatibility windows
- rollout order
- backfill behavior
- rollback or recovery expectations

## Validation Expectations

1. Validate schema and migration behavior before release when persisted state is affected.
2. If the migration risk is non-trivial, rehearse it or document the lack of rehearsal as risk.
3. Keep schema-evolution rules compatible with the project’s environment promotion model.

## Operational Guidance

1. Prefer additive changes before destructive ones.
2. Avoid coupling schema changes too tightly to one deploy step when staged compatibility is possible.
3. Keep migration safety visible in release notes, deployment docs, and quality gates where applicable.
