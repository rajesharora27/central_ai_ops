# central_ai_ops Onboarding

## Goal
Use one global AI baseline for all repos, while keeping project-specific business logic in one flattened file and SRW runtime policy in project-local `.agent/*` paths.
For multiple IDE clones of the same project, you can optionally keep project overrides in one canonical project repo and symlink from clones.

## Naming Convention
- Global files include `global-` prefix.
- Project runtime policy files include the project name, for example `dap-project-rules.md`.

## Project Layout (after bootstrap)
- `.ai_ops/global` -> symlink to `central_ai_ops/global`
- `.ai_ops/overrides/local-context.md`
- `.agent/rules/project/<project>-project-rules.md`
- `.agent/workflows/project/<project>-project-workflow.md`
- `.agent/commands/project/`
- `.cursor/rules/<project>-cursor-overrides.mdc`
- Project blueprint contract derived from `.ai_ops/global/workflows/global-application-blueprint.md` and stored at `docs/APPLICATION_BLUEPRINT.md`
- Entrypoint symlinks to `.ai_ops/global/global-MASTER.md`:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.cursorrules`
  - `GEMINI.md`

## Precedence
1. Global baseline from `.ai_ops/global/global-MASTER.md`
2. Project business context from `.ai_ops/overrides/local-context.md`
3. Project local runtime policy from `.agent/*/project/*`

Project-specific files override global files on conflict.

## Bootstrap
```bash
cd ~/dev/central_ai_ops
scripts/bootstrap_link.sh /path/to/project/repo
```

## Bootstrap With Canonical Project Source
```bash
cd ~/dev/central_ai_ops
scripts/bootstrap_link.sh --project-source /path/to/canonical/project/repo /path/to/ide/clone/repo
```

When `--project-source` is set, these project-local paths are linked from the canonical repo:
- `.ai_ops/overrides`
- `.agent/rules/project`
- `.agent/workflows/project`
- `.agent/commands/project`
- `.agent/skills/project`
- `.cursor/rules/<project>-cursor-overrides.mdc`

## Hook-based Sync
Bootstrap installs:
- `.githooks/post-checkout`
- `.githooks/post-merge`
- `.githooks/post-rewrite`

Each hook runs:
```bash
bash scripts/ensure_governance_links.sh
```

## Manual Sync
```bash
cd /path/to/project/repo
bash scripts/ensure_governance_links.sh
```

## Governance Update Check
When governance files are added or changed in `central_ai_ops`, run:

```bash
cd ~/dev/central_ai_ops
bash scripts/verify_governance_integrity.sh
```

Suggested alias in `~/.bashrc`:
```bash
alias ai-sync='bash scripts/ensure_governance_links.sh'
```

`ensure_governance_links.sh` reads these git configs if present:
- `ai.opsRoot` (required for central root)
- `ai.projectSource` (optional for canonical project override source)
