# Global Application Blueprint Template

Use this as the baseline contract for each project's `docs/APPLICATION_BLUEPRINT.md`.
Keep project versions concise, enforceable, and aligned with global SRW governance.

## Purpose

This template defines a two-layer contract in one document:
- Core Contract (stable): required architecture, policy, and safety constraints.
- Operational Appendix (volatile): commands and execution details that can change frequently.

## Core Contract (MANDATORY)

### 1. Core Principles

1. Preserve SRW boundaries.
- Skills are stateless execution helpers.
- Rules are pure policy.
- Workflows orchestrate and call Skills/Rules.

2. Enforce layer order for feature changes.
- data model/schema -> backend/workflows -> API contract -> frontend

3. Keep business logic single-source.
- Avoid duplicated filtering/validation/calculation logic across layers.
- Use adapters for shape translation only.

4. Track implementation work in the project task hub.
- Repo-changing work should have a plan in `docs/plans/`, tasks in `docs/tasks/`, completed tasks archived in `docs/tasks/completed/`, and a generated `docs/TODO.md`.

5. Keep changes safe and reversible.
- Minimize blast radius.
- Preserve backward compatibility by default.
- Prefer incremental, testable rollout.

### 2. Canonical References

Each project should define and maintain equivalent source-of-truth docs, for example:
- `/docs/plans/`
- `/docs/tasks/`
- `/docs/tasks/completed/`
- `/docs/TODO.md`
- `/docs/<appname>.md` (`<appname>` matches the repository or app-folder name and serves as the canonical app/product overview)
- `/docs/core/ARCHITECTURE.md`
- `/docs/core/APPLICATION.md`
- `/docs/core/DEVELOPMENT.md`
- `/docs/core/TESTING.md`
- `/docs/core/GRAPHQL_API.md` and/or `/docs/core/REST_API.md`
- `/docs/core/DEPLOYMENT.md`
- `/docs/core/MAINTENANCE.md`
- `/docs/CONTEXT.md`
- `/docs/CONTRIBUTING.md`
- `/docs/SECURITY.md`
- `/.agent/rules/project/<project>-project-rules.md`
- `/.agent/workflows/project/<project>-project-workflow.md`

### 3. Architecture and Module Layout

Preferred layout:

```text
backend/
  src/modules/<domain>/
frontend/
  src/features/<feature>/
  src/shared/
.agent/
  rules/project/
  workflows/project/
docs/
  core/
```

Rules:
- Backend is organized by domain module.
- Frontend is organized by feature.
- Cross-feature reusable code belongs in shared modules.
- Avoid monolithic utility/service files that mix unrelated domains.
- Reuse existing code before adding new pathways; prefer shared modules/services over duplication.

### 4. Security and Environment Governance

1. Secrets and env safety
- Never commit runtime env files (`.env`, `.env.*`) or secrets.
- Keep credentials in environment/config providers.
- No hardcoded runtime-sensitive values in app code; behavior must be configurable via typed config/env inputs.

2. Database/query safety
- Prefer ORM/client APIs.
- Avoid unsafe raw query paths unless parameterized and justified.

3. AuthN/AuthZ contract
- Authentication provider integration must not bypass local authorization policy.
- Identity mapping rules must be explicit and deterministic.

4. Runtime surface control
- Do not add dev-only endpoints/services to production runtime surfaces.

### 5. Data Modeling and Migration Safety

1. ID strategy
- Use stable, non-sequential IDs unless a domain requirement dictates otherwise.

2. Naming conventions
- Model/type names: PascalCase singular.
- Field names: camelCase.
- API field names: camelCase.

3. Soft-delete governance (when adopted)
- User-visible entities should use a soft-delete lifecycle.
- Lists/counts/dependency checks should exclude deleted rows unless restore behavior is explicit.

4. Backward compatibility
- Avoid breaking schema changes without phased migration.
- Required-field migration pattern: add nullable -> backfill -> enforce required.

5. Migration validation
- Run migration safety checks before merge/deploy.
- Rehearse migrations when risk is non-trivial.

### 6. API and Resolver Contract Safety

1. Resolver/handler responsibilities
- Validate input.
- Enforce authorization.
- Delegate business decisions to workflows/services.

2. Non-null list safety
- API fields declared as non-null lists must return arrays, never `null`.

3. Documentation synchronization
- API behavior changes require corresponding API documentation updates.

### 7. Domain Lifecycle Contracts (When Applicable)

Use explicit contracts for idempotency, ownership, and relation integrity in assignment/sync/adoption flows.

Requirements:
- Assignment flows should be idempotent.
- Ownership/plan creation guarantees should be explicit in workflow contracts.
- High-risk relation paths must have targeted regression coverage.

### 8. UI and Persistence Contract

1. UI/data synchronization
- Mutations should persist immediately for core CRUD paths.
- Avoid long-lived unsaved-change flows unless product requirements require drafts.

2. Edit interaction model
- Use dialog save/cancel for multi-field edits.
- Keep inline editing for low-risk single-field updates.

3. User-facing data quality
- Avoid displaying technical IDs directly in user-facing copy.
- Resolve foreign keys to meaningful labels where shown.

4. Cache discipline
- Use deterministic post-mutation invalidation/refetch so UI reflects persisted state.

### 9. AI Integration Contract (When Applicable)

1. Provider configuration
- Provider/runtime selection must be settings-driven with env fallback.
- Required provider env/config must be validated at startup.
- Model/provider assumptions should be explicit and portable across supported vendors.

2. Result interaction pattern
- Centralize action handling for AI-produced records.
- Prefer review/preview flows over brittle direct navigation.
- Support tolerant identifier mapping when AI output references related entities.

3. Evaluation contract
- AI behavior changes should have representative eval coverage and regression examples.
- Formatting and output-contract expectations should be validated, not assumed.

4. Observability contract
- AI execution should emit enough structured telemetry to diagnose provider/model choice, retries, latency, tool usage, and degraded behavior safely.

5. Rollout and fallback contract
- High-risk AI changes should support staged rollout, kill switches, or rollback-friendly configuration where practical.
- Degraded-mode behavior should be explicit rather than accidental.

6. Async reliability contract
- Background AI jobs, notifications, summaries, and other fan-out flows should respect provider rate limits and use bounded retries with idempotency rules.

7. Safety contract
- AI features should define safety expectations, escalation rules, and safe fallback behavior for sensitive or high-risk outputs.

8. Output contract
- AI-produced content should have explicit rendering or schema expectations and graceful degradation rules when formatting breaks.

9. Provenance and retrieval contract
- Retrieval-dependent features should define allowed sources, freshness expectations, and how grounded vs inferred content is handled.

10. Memory and context contract
- Context assembly, summary reuse, and memory retention should be explicit enough to avoid stale-state drift and accidental prompt leakage.

11. Privacy and retention contract
- AI-related prompts, summaries, logs, and derived artifacts should follow explicit minimization, retention, deletion, and export expectations.

12. Incident contract
- High-risk systems should define incident ownership, recovery behavior, and escalation expectations.

13. Performance and cost contract
- AI and adjacent systems should define latency, timeout, and cost expectations where they materially affect user experience or operating risk.

14. Environment parity contract
- Projects should define meaningful parity expectations across local, test, stage, prod, and cross-agent environments.

15. User-experience reliability contract
- User-visible loading, retry, degraded-mode, and recovery behavior should be intentional and tested where practical.

16. Schema and migration contract
- Persisted-state changes should follow compatibility-first, rollout-safe migration patterns with explicit validation expectations.

### 10. Quality and Release Contract

Before merge/deploy:
- Required quality checks pass (lint, typecheck, dependency, targeted tests).
- Every new feature has unit coverage, and integration coverage is updated where boundaries changed.
- AI behavior changes have representative eval coverage or an explicitly documented gap.
- Safety, output-contract, provenance, context, and privacy expectations are addressed for AI changes where relevant.
- Incident, performance/cost, parity, user-reliability, and migration expectations are addressed where relevant.
- User-facing flows affected by the change have been validated from the application perspective.
- Governance checks pass (SRW, modular layout, repo hygiene, migration safety as applicable).
- Release risk/parity checks pass for promotions.
- Targeted regression suites pass when impacted.

### 11. Deployment and Environment Hierarchy Contract

Promotion sequence:
- local dev -> test -> stage -> prod

Rules:
- Stage validation is required before production.
- Database consistency verification is required before deployment.
- Promotion is blocked when risk/parity checks fail.
- Deployment scripts should run the relevant validation before shipping and must not deploy when required tests fail.
- AI releases should support staged rollout, kill switches, or an explicit documented fallback path when practical.
- Environment parity and migration readiness should be considered before promotion to higher environments.

### 12. Documentation Contract

1. Keep docs canonical and non-duplicative.
2. Use root-relative internal links with correct casing.
3. Update applicable docs on every completed task that changes behavior, contracts, workflows, architecture, or developer expectations.
4. Keep `/docs/<appname>.md`, `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, and `/docs/APPLICATION_BLUEPRINT.md` aligned with the current product and engineering reality.
5. Keep release notes current with concise, versioned entries.
6. Avoid stale references, duplicated policy text, and long debugging timelines in blueprint docs.

### 13. Compliance Checklist

- [ ] SRW boundaries are preserved.
- [ ] Task hub artifacts (plan, tasks, TODO, completed archive) are updated for repo-changing work.
- [ ] Layer order (data -> backend -> API -> frontend) is respected.
- [ ] Business logic is canonical and not duplicated.
- [ ] Code reuse was considered before adding new pathways, and the result remains simple/readable.
- [ ] AI behavior changes have evaluation coverage, explicit provider/runtime assumptions, and sufficient observability.
- [ ] Async and fan-out paths handle retries, pacing, idempotency, and provider limits appropriately.
- [ ] AI safety, output-contract, provenance, context, and privacy expectations are explicitly handled where relevant.
- [ ] Incident, cost/performance, parity, user-reliability, and schema/migration expectations are explicitly handled where relevant.
- [ ] Schema changes are backward-compatible and migration-safe.
- [ ] API non-null and soft-delete contracts are preserved (when applicable).
- [ ] Security/env/auth governance requirements are met.
- [ ] Required tests and quality gates pass.
- [ ] Release risk/parity checks pass.
- [ ] Docs and internal references are updated.

## Operational Appendix (Template)

### Appendix A. Standard Command Set

Quality checks (project-specific):

```bash
# Example placeholders:
# npm run lint:ci
# npm run typecheck
# npm run test
```

Governance checks (project-specific):

```bash
# Example placeholders:
# bash scripts/repo-clean-audit.sh --staged
# bash scripts/srw-audit.sh --staged
# bash scripts/check-migration-safety.sh
```

Release risk and parity checks (project-specific):

```bash
# Example placeholders:
# npm run check:release-risk
# ./scripts/verify-env-parity.sh
# ./scripts/verify-database-consistency.sh
```

### Appendix B. Targeted Regression Gate

Define and maintain explicit targeted suites for high-risk domains (assignment/sync/auth/migrations/AI workflows).

### Appendix C. Maintenance Rule For This File

- Keep Core Contract sections stable and policy-focused.
- Keep volatile commands/check invocations in Operational Appendix only.
- Update appendix commands first when operational tooling changes.

---

Use this template as the minimum architecture and release contract across projects.
