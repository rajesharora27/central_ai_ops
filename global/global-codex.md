# Global Codex Baseline

CRITICAL: Follow centralized AI governance. Plans go in docs/plans/, tasks in docs/tasks/. Never use tool-specific storage paths. See @.ai_ops/global/rules/global-ai-agent-compliance.md.

Canonical global baseline:
- `.ai_ops/global/global-MASTER.md`

Context bootstrap requirement (when present in repo):
- `docs/CONTEXT.md`
- `docs/CONTRIBUTING.md`
- `docs/APPLICATION_BLUEPRINT.md`
- `docs/<appname>.md` where `<appname>` matches the repository or app-folder name
- Read these at agent startup and on every context refresh.
- Before closing a task, update every impacted project doc in this canonical set.

Codex loads instructions from `AGENTS.md` (symlinked to `.ai_ops/global/global-MASTER.md`).
Additional context paths are configured in `.vscode/settings.json` via `codex.instructions.path`
and `codex.context.include`.

Load order:
1. `.ai_ops/global/global-MASTER.md`
2. `.ai_ops/overrides/local-context.md`
3. `.agent/rules/global/*.md`
4. `.agent/rules/project/*.md`
5. `.agent/workflows/global/*.md`
6. `.agent/workflows/project/*.md`
7. `.agent/commands/global/*.md`
8. `.agent/commands/project/*.md`
9. `.agent/skills/global/**/SKILL.md`
10. `.agent/skills/project/**/SKILL.md`

Project-local policy overrides global policy on conflict.
