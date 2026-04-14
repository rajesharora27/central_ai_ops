# Skill: SRW Architecture Audit

## Purpose

Detect SRW boundary violations: inline database queries in workflow/handler modules, orchestration logic leaking into skills, and hardcoded policy in skills.

## When to Run

- Before any backend commit (pre-commit hook, `--staged` mode)
- During code review
- On demand via `npm run audit:srw`

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--path <dir>` | `supabase/functions/app-api/` | Root directory to scan |
| `--handlers <subdir>` | `handlers/` | Handler subdirectory relative to path |
| `--skills <subdir>` | `skills/` | Skill subdirectory relative to path |
| `--staged` | off | Only check git-staged files |
| `--ci` | off | Strict mode: exit 1 on any finding |

## Checks

| Check | Severity | Pattern |
|-------|----------|---------|
| `.from(` in handler files | BLOCK | Inline Supabase query in orchestration layer |
| Direct SQL keywords in handlers | BLOCK | `SELECT`, `UPDATE`, `INSERT INTO`, `DELETE FROM` as string literals |
| Complex orchestration in skills | WARN | Retry loops, multi-step try/catch chains in skill files |

## Outputs

- Exit 0: no violations
- Exit 1: one or more BLOCK-level findings
- Each finding: `file:line: [BLOCK|WARN] description`

## Invocation

```bash
bash .agent/skills/global/srw-audit/srw-audit.sh --path supabase/functions/app-api/
bash .agent/skills/global/srw-audit/srw-audit.sh --staged
```

## Example

```
handlers/import.ts:42: [BLOCK] .from() call found in handler — delegate to skills/
handlers/admin.ts:155: [BLOCK] Direct SQL string "SELECT * FROM" in handler
skills/billing.ts:88: [WARN] Nested try/catch with retry — consider moving orchestration to handler
```
