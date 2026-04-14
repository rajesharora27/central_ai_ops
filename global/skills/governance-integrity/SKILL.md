# Skill: Governance Integrity Report

## Purpose

Validate that governance symlinks are intact and all mandatory governance files are present and readable.

## When to Run

- On checkout, merge, and rebase (post-checkout/post-merge hooks — already wired)
- As part of smoke test suite
- On demand via `npm run audit:governance`

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--path <dir>` | `.` | Project root to validate |

## Checks

- All mandatory governance files exist and are readable
- Symlinks in `.agent/`, `.ai_ops/global`, `.cursor/rules/` resolve correctly
- Required content markers are present in governance files
- No orphaned or broken symlinks

## Outputs

- Exit 0: all governance files valid
- Exit 1: missing or broken governance

## Invocation

Wraps the existing `scripts/verify_governance_integrity.sh` from central_ai_ops.

```bash
bash scripts/verify_governance_integrity.sh
# or via npm:
npm run audit:governance
```
