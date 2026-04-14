# Skill: Secret Scan

## Purpose

Prevent hardcoded secrets, API keys, and credentials from being committed to tracked files.

## When to Run

- Before every commit (pre-commit hook, `--staged` mode, blocking)
- On demand via `npm run audit:secrets`

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--staged` | off | Only check git-staged files |
| `--path <dir>` | `.` | Directory to scan |
| `--exclude <pattern>` | none | Glob pattern to exclude (e.g., test fixtures) |

## Checks

| Pattern | Description |
|---------|-------------|
| `sk-[a-zA-Z0-9]{20,}` | OpenAI/Stripe secret keys |
| `sk_live_`, `sk_test_` | Stripe keys |
| `AKIA[A-Z0-9]{16}` | AWS access keys |
| `-----BEGIN` | Private key content |
| `eyJ[a-zA-Z0-9_-]{40,}` | Long JWT/base64 tokens (>60 chars) |
| `.env` files staged | Environment files (except `.env.example`) |
| `supabase_service_role` patterns | Supabase service keys |
| `password\s*=\s*["'][^"']+["']` | Hardcoded passwords |

## Outputs

- Exit 0: no secrets found
- Exit 1: one or more findings
- Each finding: `file:line: [BLOCK] description`

## Invocation

```bash
bash .agent/skills/global/secret-scan/secret-scan.sh --staged
bash .agent/skills/global/secret-scan/secret-scan.sh --path src/
```
