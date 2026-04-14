# Skill: Migration Safety Validator

## Purpose

Catch destructive DDL in database migrations before they reach production.

## When to Run

- Before any commit that includes migration files (pre-commit hook, `--staged` mode)
- During deploy (deploy script integration)
- On demand via `npm run audit:migrations`

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--path <dir>` | `supabase/migrations/` | Directory containing SQL migration files |
| `--staged` | off | Only check git-staged migration files |
| `--file <path>` | none | Check a single migration file |

## Checks

| Check | Severity | Pattern |
|-------|----------|---------|
| `DROP TABLE` | BLOCK | Destroys data irrecoverably |
| `TRUNCATE` | BLOCK | Destroys all rows |
| `DELETE FROM` without WHERE | BLOCK | Destroys all rows |
| `DROP COLUMN` | WARN | Potentially destructive schema change |
| `ALTER ... TYPE` | WARN | Column type change may lose data |
| `DROP FUNCTION` | INFO | Usually safe for recreate patterns |
| `DROP INDEX` | INFO | Usually safe, may affect performance during rebuild |

## Outputs

- Exit 0: no BLOCK findings
- Exit 1: one or more BLOCK findings
- Each finding: `file:line: [BLOCK|WARN|INFO] DDL statement`

## Invocation

```bash
bash .agent/skills/global/migration-safety/migration-safety.sh --path supabase/migrations/
bash .agent/skills/global/migration-safety/migration-safety.sh --staged
bash .agent/skills/global/migration-safety/migration-safety.sh --file supabase/migrations/126_fix.sql
```
