# Skill: Documentation Sync Validator

## Purpose

Detect when code changes affect documented behavior but the corresponding docs weren't updated.

## When to Run

- Before push (pre-push hook, warn-only)
- During code review
- On demand via `npm run audit:docs`

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--triggers <path>` | `.ai_ops/overrides/doc-sync-triggers.json` | Path to project-specific trigger config |
| `--staged` | off | Check staged files only |
| `--diff <base>` | none | Check files changed since `<base>` ref |

## Trigger Config Format

Projects supply a JSON file mapping file patterns to required documentation files:

```json
{
  "triggers": [
    { "pattern": "supabase/functions/chat/**", "docs": ["docs/vigo-internals.md"], "label": "Chat runtime" },
    { "pattern": "app/(admin)/**", "docs": ["docs/vigo.md"], "label": "Admin capabilities" },
    { "pattern": "supabase/migrations/**", "docs": ["docs/CONTRIBUTING.md"], "label": "Schema changes" }
  ]
}
```

## Outputs

- Exit 0: no stale docs detected (or no trigger config found)
- Exit 1 (with `--ci`): stale docs detected
- Each finding: `[WARN] <label>: changed <pattern> but <doc> not updated`

## Invocation

```bash
bash .agent/skills/global/doc-sync-check/doc-sync-check.sh --staged
bash .agent/skills/global/doc-sync-check/doc-sync-check.sh --diff origin/main
```
