# central_ai_ops

`central_ai_ops` is the shared governance source for all AI-enabled project environments. It keeps one global policy baseline in this repo and projects consume that baseline through linked governance files plus project-local docs and overrides.

The baseline is intentionally cross-agent: Cursor, Codex, Claude, Gemini, Copilot, and other compatible agents should inherit the same governance expectations unless a project-local override explicitly narrows them.

## Governance Model

The model has three active layers:

1. **Global baseline** in this repo under `global/`
   Shared rules, workflows, command playbooks, cursor guidance, and compatibility docs.
2. **Project business context** in each project under `.ai_ops/overrides/local-context.md`
   This file points at the project’s canonical docs such as `docs/CONTEXT.md`, `docs/CONTRIBUTING.md`, `docs/APPLICATION_BLUEPRINT.md`, and `docs/<appname>.md`.
3. **Project runtime policy** in each project under `.agent/*/project/`
   Project-specific rules, workflows, commands, and skills that override the global baseline when needed.

Precedence is simple: project-local policy wins over global policy on conflict.

## Two Scripts

These are the only user-facing governance scripts:

1. `scripts/bootstrap_link.sh`
   First-time setup for a new project. It installs the governance baseline, configures git hooks, and can replace old governance wrappers so the project starts cleanly.
2. `scripts/ensure_governance_links.sh`
   Safe anytime sync for an existing project. By default it only creates missing governance files and links. It does not overwrite existing files unless you pass `--force`.

Quick examples:

```bash
# First-time setup
cd ~/dev/central_ai_ops
scripts/bootstrap_link.sh /path/to/project

# Safe anytime sync from inside a project
cd /path/to/project
bash scripts/ensure_governance_links.sh

# Preview changes without writing
bash scripts/ensure_governance_links.sh --dry-run

# Replace conflicting governance wrappers only when intentional
bash scripts/ensure_governance_links.sh --force
```

## What Bootstrap Installs

For a bootstrapped project, the governance layer looks like this:

```text
project/
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  .cursorrules
  .github/copilot-instructions.md
  .ai_ops/
    global/                  -> symlink to central_ai_ops/global
    overrides/
      local-context.md
  .agent/
    rules/global/            -> symlink
    rules/project/
    workflows/global/        -> symlink
    workflows/project/
    commands/global/         -> symlink
    commands/project/
    skills/global/           -> symlink
    skills/project/
  .cursor/rules/
  .vscode/settings.json
  opencode.json
  scripts/ensure_governance_links.sh
  docs/
    CONTEXT.md
    CONTRIBUTING.md
    APPLICATION_BLUEPRINT.md
    <appname>.md
```

The root AI instruction files point to the global master baseline, while project context and runtime policy are loaded from the linked local paths.

## Documentation Contract

Every governed project is expected to keep these canonical docs current:

- `docs/CONTEXT.md`
- `docs/CONTRIBUTING.md`
- `docs/APPLICATION_BLUEPRINT.md`
- `docs/<appname>.md`

Agents must read them at startup and context refresh when present. Agents must also update the relevant docs before closing any task that changes behavior, architecture, workflows, or developer expectations.

## Global Rules

The canonical rule files under `global/rules/` are:

| Rule file | Short text | Detailed text |
|-----------|------------|---------------|
| `global-core-governance.md` | Sets the baseline operating behavior for governed repos. | Defines the default expectations around determinism, observability, documentation upkeep, reuse-first implementation, readable code, and validating changes from the user’s perspective. |
| `global-architecture-srw.md` | Makes SRW the mandatory application architecture. | Defines the Skill / Rule / Workflow contract, explains what belongs in each layer, and flags architectural regressions such as database access inside workflows, orchestration inside skills, or business policy hardcoded in executable helpers. |
| `global-task-governance.md` | Standardizes the task hub workflow for repo changes. | Requires the plan -> tasks -> `npm run tasks:sync` -> implement sequence, defines task IDs/frontmatter/status rules, and requires completed tasks to move into `docs/tasks/completed/` with `docs/TODO.md` regenerated. |
| `global-artifact-governance.md` | Defines where plans, tasks, and ledgers must live. | Ensures project work artifacts are stored in-repo under `docs/plans/`, `docs/tasks/`, `docs/tasks/completed/`, and `docs/TODO.md`, and prevents tasking/governance records from living only in tool-specific folders or chat context. |
| `global-change-safety.md` | Keeps changes small, reversible, and low-blast-radius. | Guides implementation toward incremental edits, safer migration patterns, compatibility-first behavior, and avoiding unnecessary scope expansion during delivery. |
| `global-quality-gates.md` | Defines the minimum validation and code-health bar. | Requires feature unit tests, integration updates where boundaries change, user-flow validation, deploy blocking on failed checks, reuse-first implementation, and simple/formatted/readable code. |
| `global-ai-evaluation-governance.md` | Makes AI behavior changes ship with eval coverage. | Requires representative evals, regression examples, explicit pass/fail expectations, and treating evaluation regressions as release risk rather than relying only on code tests. |
| `global-model-and-provider-governance.md` | Keeps provider/model choices portable and auditable. | Requires configuration-driven model/provider selection, explicit capability assumptions, provider abstraction, and documented fallback behavior instead of hardcoded vendor-specific logic. |
| `global-ai-observability.md` | Makes AI behavior diagnosable in production. | Requires structured telemetry for provider/model choice, latency, retries, tool usage, degraded states, and operational diagnosis without leaking sensitive data. |
| `global-release-and-rollout-governance.md` | Adds blast-radius control for AI releases. | Requires staged rollout thinking, kill switches or rollback paths when practical, and explicit release hygiene for prompt/model/tool changes. |
| `global-background-jobs-and-retries.md` | Hardens async AI and communication workloads at scale. | Requires bounded retries, idempotency, pacing or queueing, rate-limit awareness, and partial-failure visibility for fan-out workloads like emails, summaries, and async inference. |
| `global-ai-safety-governance.md` | Defines baseline safety expectations for AI outputs. | Requires explicit safety constraints, escalation rules, hallucination-aware fallback behavior, and validation of sensitive or high-risk AI behaviors. |
| `global-output-contracts.md` | Keeps AI output predictable for rendering and parsing. | Requires explicit output-shape or formatting expectations, graceful degradation for malformed output, and shared parser/normalizer discipline. |
| `global-data-provenance-and-rag.md` | Governs where AI knowledge comes from and how it is grounded. | Requires approved source boundaries, freshness expectations, retrieval discipline, and clear handling of grounded versus inferred content. |
| `global-memory-and-context-governance.md` | Controls what enters memory and how context is reused. | Requires explicit context sources, summary refresh rules, chronology hygiene, and guardrails against stale or privacy-unsafe memory reuse. |
| `global-privacy-retention-and-deletion.md` | Makes AI data handling privacy-aware by default. | Requires minimization, retention, deletion, export compatibility, and clearer rules for prompts, logs, summaries, and derived AI artifacts. |
| `global-incident-response.md` | Defines how governed repos should respond when things go wrong. | Requires incident classes, recovery paths, escalation expectations, and a credible response model for harmful or degraded AI/app behavior. |
| `global-performance-and-cost-budgets.md` | Keeps latency and cost from drifting silently. | Requires explicit performance/cost expectations, validation of meaningful regressions, and visibility into tradeoffs when AI/runtime changes affect budgets. |
| `global-environment-parity.md` | Reduces hidden differences across environments and agents. | Requires explicit parity expectations for local/test/stage/prod and cross-agent environments so releases are not trusted on accidental config drift. |
| `global-user-experience-reliability.md` | Makes user-facing reliability part of the product contract. | Requires intentional loading, retry, degraded-mode, and recovery behavior so users are not stranded even when subsystems fail. |
| `global-schema-and-migration-governance.md` | Hardens persisted-state changes and schema evolution. | Requires compatibility-first migration patterns, rollout-safe data evolution, and validation/recovery expectations before schema changes ship. |
| `global-security.md` | Protects secrets, auth, and production safety. | Covers environment handling, secret hygiene, auth/authz expectations, safer query usage, and security preflight rules so governed repos do not ship unsafe operational behavior. |
| `global-conflict-resolution.md` | Explains how global and project-local rules interact. | Establishes precedence so project-local runtime policy can override global governance on conflict while keeping the global baseline intact as the default. |

Other baseline governance files:

- `global/global-MASTER.md`
  Canonical baseline, priorities, mandatory inputs, and load order.
- `global/workflows/global-implementation-checklist.md`
  The standard execution checklist for agents.
- `global/workflows/global-application-blueprint.md`
  The baseline template for each project’s `docs/APPLICATION_BLUEPRINT.md`.
- `global/commands/*.md`
  Shared command playbooks for commit, test, lint, deploy, security audit, and release work.
- `global/skills/global-skill-authoring-guidelines.md`
  Guidance for writing and maintaining reusable skills.
- `global/cursor/global-cursor-rule.mdc`
  Cursor-specific baseline behavior.
- `global/global-AGENTS.md`, `global/global-CLAUDE.md`, `global/global-codex.md`, `global/global-opencode.md`
  Compatibility wrappers and tool-specific baseline references.

## Workflow

For a new project:

```bash
cd ~/dev/central_ai_ops
scripts/bootstrap_link.sh /path/to/project
```

For a project that already uses this governance model:

```bash
cd /path/to/project
bash scripts/ensure_governance_links.sh
```

For multi-clone setups where one canonical repo owns project-local overrides:

```bash
cd ~/dev/central_ai_ops
scripts/bootstrap_link.sh \
  --project-source /path/to/canonical/project \
  /path/to/ide/clone
```

## Governance Maintenance

When you change files under `global/`:

1. Update the relevant global rule/workflow/command docs.
2. Update this repo’s documentation when the operating model changes.
3. Keep the central task hub (`docs/plans/`, `docs/tasks/`, `docs/tasks/completed/`, `docs/TODO.md`) aligned with the change.
4. Run `bash scripts/verify_governance_integrity.sh`.
5. Existing projects can then run `bash scripts/ensure_governance_links.sh` safely at any time.

`verify_governance_integrity.sh` is the maintainer check for this repo. It is not part of the normal project bootstrap/sync flow.

The baseline blueprint template lives at `global/workflows/global-application-blueprint.md`.
