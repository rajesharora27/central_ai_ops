# Global AGENTS Baseline (Compatibility)

Canonical global baseline:
- `.ai_ops/global/global-MASTER.md`

Context bootstrap requirement (when present in repo):
- `docs/CONTEXT.md`
- `docs/CONTRIBUTING.md`
- `docs/APPLICATION_BLUEPRINT.md`
- `docs/<appname>.md` where `<appname>` matches the repository or app-folder name
- Read these at agent startup and on every context refresh.
- Before closing a task, update every impacted project doc in this canonical set.

Load this compatibility file only for legacy setups.
For all current setups, AGENTS.md should point directly to `.ai_ops/global/global-MASTER.md`.

@.ai_ops/global/global-MASTER.md
