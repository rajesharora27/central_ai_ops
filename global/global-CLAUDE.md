# Global CLAUDE Baseline (Compatibility)

CRITICAL: Follow centralized AI governance. Plans go in docs/plans/, tasks in docs/tasks/. Never use .claude/plans/ or any tool-specific storage. See @.ai_ops/global/rules/global-ai-agent-compliance.md.

Canonical global baseline:
@.ai_ops/global/global-MASTER.md

Context bootstrap requirement (when present in repo):
- `docs/CONTEXT.md`
- `docs/CONTRIBUTING.md`
- `docs/APPLICATION_BLUEPRINT.md`
- `docs/<appname>.md` where `<appname>` matches the repository or app-folder name
- Read these at agent startup and on every context refresh.
- Before closing a task, update every impacted project doc in this canonical set.

Project context (loaded via local-context.md @refs):
@.ai_ops/overrides/local-context.md

Use this compatibility file only for legacy setups.
For current setups, repo entrypoints should point directly to `.ai_ops/global/global-MASTER.md`.
