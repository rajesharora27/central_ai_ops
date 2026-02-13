# Global Cursor Rules Reference

Cursor should load the shared master baseline and then project context.
- Global baseline: `.ai_ops/global/global-MASTER.md`
- Global cursor rule file: `.ai_ops/global/cursor/global-cursor-rule.mdc`
- Project local context: `.ai_ops/overrides/local-context.md`
- Optional cursor-specific project override: `.cursor/rules/*-cursor-overrides.mdc`

Project-local context and project overrides win on conflict.
