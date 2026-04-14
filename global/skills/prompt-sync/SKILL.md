# Skill: Prompt Sync Validator

## Purpose

Ensure the condensed (LLM-optimized) system prompt and the human-readable system prompt contain the same semantic sections, key terms, and safety flags.

## When to Run

- Before any commit touching system prompt files (pre-commit hook)
- As part of smoke test suite
- On demand via `npm run audit:prompt-sync`

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--condensed <path>` | `config/system-instructions.md` | Path to LLM-optimized prompt |
| `--readable <path>` | `config/system-instructions-readable.md` | Path to human-readable prompt |
| `--terms <path>` | none | Optional JSON file with project-specific key terms to check |

## Checks

- All `## Section` headers in readable exist in condensed (fuzzy-matched)
- All `## Section` headers in condensed exist in readable
- Key safety terms and flags present in both files
- Byte-size ratio within expected bounds (condensed 30-60% smaller)

## Outputs

- Exit 0: prompts in sync
- Exit 1: section or term mismatches found
- Reports: missing sections, missing terms, size comparison

## Invocation

```bash
bash .agent/skills/global/prompt-sync/prompt-sync.sh
bash .agent/skills/global/prompt-sync/prompt-sync.sh --condensed config/prompt.md --readable config/prompt-full.md
```
