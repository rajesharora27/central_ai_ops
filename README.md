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

The main global governance sources are:

- `global/global-MASTER.md`
  Canonical baseline, priorities, mandatory inputs, and load order.
- `global/rules/global-core-governance.md`
  Core expectations for repository behavior, determinism, and doc upkeep.
- `global/rules/global-architecture-srw.md`
  SRW architecture contract: Skills are stateless, Rules are policy, Workflows orchestrate.
- `global/rules/global-task-governance.md`
  Task lifecycle, task IDs, completion rules, and mandatory documentation updates.
- `global/rules/global-artifact-governance.md`
  Canonical storage rules for plans, tasks, completed-task archives, and `docs/TODO.md`.
- `global/rules/global-change-safety.md`
  Change-minimization and reversibility rules.
- `global/rules/global-quality-gates.md`
  Validation expectations, feature-test requirements, deploy blocking, reuse-first implementation, and release hygiene.
- `global/rules/global-security.md`
  Secrets, ORM/query safety, and security pre-flight checks.
- `global/rules/global-conflict-resolution.md`
  Rule precedence between global and project-local policy.
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
