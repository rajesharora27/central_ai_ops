# central_ai_ops Onboarding

## Goal

Give every AI-enabled project the same global governance baseline while preserving project-specific docs and project-specific runtime policy.

This baseline is meant to apply consistently across Cursor, Codex, Claude, Gemini, Copilot, and similar environments.

## The Two Scripts

- `scripts/bootstrap_link.sh`
  Use this once when introducing governance to a new project or new clone.
- `scripts/ensure_governance_links.sh`
  Use this anytime afterward. It is safe by default and only creates missing governance files and links unless `--force` is passed.

## Bootstrap

```bash
cd ~/dev/central_ai_ops
scripts/bootstrap_link.sh /path/to/project/repo
```

This does four things:

1. Sets git config pointers back to `central_ai_ops`.
2. Installs safe auto-sync hooks.
3. Creates or links the governance directory structure.
4. Enforces the initial governance baseline.

## Bootstrap With Canonical Project Source

```bash
cd ~/dev/central_ai_ops
scripts/bootstrap_link.sh \
  --project-source /path/to/canonical/project/repo \
  /path/to/ide/clone/repo
```

When `--project-source` is set, these project-local paths come from the canonical repo:

- `.ai_ops/overrides`
- `.agent/rules/project`
- `.agent/workflows/project`
- `.agent/commands/project`
- `.agent/skills/project`
- `.cursor/rules/<project>-cursor-overrides.mdc`

## Safe Anytime Sync

```bash
cd /path/to/project/repo
bash scripts/ensure_governance_links.sh
```

Useful variants:

```bash
# Preview only
bash scripts/ensure_governance_links.sh --dry-run

# Replace conflicting governance wrappers when intentional
bash scripts/ensure_governance_links.sh --force
```

## Expected Project Docs

Governed projects should maintain:

- `docs/CONTEXT.md`
- `docs/CONTRIBUTING.md`
- `docs/APPLICATION_BLUEPRINT.md`
- `docs/<project>.md`

These are the canonical project docs referenced by `.ai_ops/overrides/local-context.md`.
The baseline template for `docs/APPLICATION_BLUEPRINT.md` lives at `global/workflows/global-application-blueprint.md`.
Repo-changing work should also follow the task-hub convention: `docs/plans/`, `docs/tasks/`, `docs/tasks/completed/`, and generated `docs/TODO.md`.

## Hook-Based Sync

Bootstrap installs:

- `.githooks/post-checkout`
- `.githooks/post-merge`
- `.githooks/post-rewrite`

Each hook runs:

```bash
bash scripts/ensure_governance_links.sh
```

## Maintainer Check

When you change governance files in `central_ai_ops`, run:

```bash
cd ~/dev/central_ai_ops
bash scripts/verify_governance_integrity.sh
```

Suggested alias:

```bash
alias ai-sync='bash scripts/ensure_governance_links.sh'
```
