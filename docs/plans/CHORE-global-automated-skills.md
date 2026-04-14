# Plan: Global Automated Skills for AI Governance

## Context

Vigo (and future projects) have strong governance rules defined in `central_ai_ops/global/rules/` but no enforcement automation. Skills should live in `central_ai_ops/global/skills/` so they're portable across all AI environments (Claude Code, Codex, Cursor, Antigravity) and automatically symlinked into every project via the existing governance linking system.

Each skill consists of:
1. **SKILL.md** — AI-agent-readable markdown definition (purpose, inputs, outputs, invocation)
2. **Portable shell script** — the actual automation, runnable by any CI/agent/human

The linking chain: `central_ai_ops/global/skills/` → symlinked to `.agent/skills/global/` in each project.

---

## Skill Architecture

```text
central_ai_ops/
  global/
    skills/
      global-skill-authoring-guidelines.md    # (existing)
      srw-audit/
        SKILL.md                              # AI-readable skill definition
        srw-audit.sh                          # Portable script
      doc-sync-check/
        SKILL.md
        doc-sync-check.sh
      migration-safety/
        SKILL.md
        migration-safety.sh
      secret-scan/
        SKILL.md
        secret-scan.sh
      task-ref-check/
        SKILL.md
        task-ref-check.sh
      governance-integrity/
        SKILL.md                              # Wraps existing verify_governance_integrity.sh
  scripts/
    verify_governance_integrity.sh            # (existing)
    ensure_governance_links.sh                # (existing)
```

Each project then gets these via symlink:
```text
vigo/.agent/skills/global/ → central_ai_ops/global/skills/
```

Any AI agent in any environment loads `SKILL.md` files from `.agent/skills/global/**/SKILL.md` (already in the load order defined by `opencode.json`, Cursor rules, and CLAUDE.md).

---

## Skill 1: SRW Architecture Audit

**Purpose**: Detect SRW boundary violations — inline DB queries in handlers, orchestration logic in skills, hardcoded policy in skills.

**SKILL.md** defines:
- When to run: before any backend commit, during code review, on demand
- What it checks:
  - `.from(` calls in `handlers/` files → BLOCK
  - Direct SQL (`SELECT`, `UPDATE`, `INSERT`, `DELETE`) in handler files → BLOCK
  - Complex orchestration (retry loops, multi-step if/else) in `skills/` files → WARN
  - Policy constants hardcoded in `skills/` instead of config/rules → WARN
- Inputs: `--path <dir>` (defaults to `supabase/functions/app-api/`), `--staged` (git staged files only)
- Outputs: pass/fail with file:line:violation

**srw-audit.sh**: Portable bash script using `grep`/`rg`. No project-specific assumptions — the handler and skill directory paths are parameters.

---

## Skill 2: Documentation Sync Validator

**Purpose**: Detect when code changes affect documented behavior but docs weren't updated.

**SKILL.md** defines:
- When to run: before push, during code review
- What it checks: maps changed file patterns to documentation trigger rules
  - Chat/protocol runtime → internals doc
  - Admin capabilities → product doc
  - User-facing flows → product doc
  - Schema changes → contributing doc
  - Settings/screens → guide doc
- Inputs: `--triggers <triggers-config-path>` (project provides a config mapping paths to docs), `--staged` or `--diff <base>`
- Outputs: list of docs that likely need updating, or pass

**doc-sync-check.sh**: Reads a project-supplied triggers config file (e.g., `.ai_ops/overrides/doc-sync-triggers.json`) that maps file glob patterns to required doc files. The script is generic; the config is project-specific.

---

## Skill 3: Migration Safety Validator

**Purpose**: Catch destructive DDL in database migrations before they reach production.

**SKILL.md** defines:
- When to run: before commit, during deploy
- What it checks:
  - `DROP TABLE`, `TRUNCATE`, `DELETE FROM` without WHERE → BLOCK
  - `DROP COLUMN`, `ALTER TYPE` → WARN
  - `DROP FUNCTION`, `DROP INDEX` → INFO (usually safe for recreate patterns)
  - Sequential numbering gaps or duplicates
  - Missing comment headers
- Inputs: `--path <migrations-dir>`, `--staged`, `--file <single-file>`
- Outputs: block/warn/info with file:line and DDL statement

**migration-safety.sh**: Generic — works with any sequential-numbered SQL migration directory.

---

## Skill 4: Secret Scan

**Purpose**: Prevent hardcoded secrets from being committed to tracked files.

**SKILL.md** defines:
- When to run: before every commit (blocking)
- What it checks:
  - API key patterns (`sk-`, `sk_live_`, `sk_test_`, `AKIA`, long base64 strings)
  - Private key content (`-----BEGIN`)
  - `.env` files being staged (except `.env.example`)
  - Supabase service role keys
  - Embedded credentials in URLs
- Inputs: `--staged`, `--path <dir>`, `--exclude <pattern>` (for test fixtures)
- Outputs: block with file:line and matched pattern

**secret-scan.sh**: Generic, no project-specific assumptions.

---

## Skill 5: Task Reference Validator

**Purpose**: Ensure commits reference tracked task IDs for traceability.

**SKILL.md** defines:
- When to run: at commit time (commit-msg hook)
- What it checks:
  - Commit message contains `[FEAT-NNN]`, `[FIX-NNN]`, or `[CHORE-NNN]`
  - Referenced task file exists in `docs/tasks/` or `docs/tasks/completed/`
  - Warns if referencing a `done` task
- Inputs: commit message (via `$1` in commit-msg hook)
- Outputs: pass/warn

**task-ref-check.sh**: Reads the commit message and validates against `docs/tasks/` structure.

---

## Skill 6: Governance Integrity Report

**Purpose**: Validate governance symlinks and mandatory file presence.

**SKILL.md** defines:
- When to run: on checkout, merge, and in smoke suite
- What it checks: wraps existing `verify_governance_integrity.sh`
- Inputs: `--path <project-root>`
- Outputs: pass/fail with missing or broken items listed

No new script needed — SKILL.md wraps the existing `scripts/verify_governance_integrity.sh`.

---

## Rule Amendment: AI Governance Compliance (All Agents)

**Problem**: AI agents (Claude, Codex, Cursor, Antigravity) routinely bypass central governance — storing plans in tool-specific directories (`.claude/plans/`), skipping task creation, ignoring doc sync, and not following the load order. The rules exist but agents treat them as suggestions.

**This is not a skill — it's a mandatory rule addition** to `central_ai_ops/global/rules/`.

### New file: `central_ai_ops/global/rules/global-ai-agent-compliance.md`

Content:

```markdown
# Global AI Agent Compliance — Mandatory

## First Principle

Every AI agent — regardless of vendor, IDE, or runtime — MUST follow centralized AI governance
as defined in `.ai_ops/global/global-MASTER.md` and the full load order below. No agent-specific
defaults, tool-specific storage paths, or convenience shortcuts override this governance.

## Load Order (Mandatory, Every Session)

1. `.ai_ops/global/global-MASTER.md` — global baseline
2. `.ai_ops/global/rules/global-*.md` — all global rules
3. `.ai_ops/global/workflows/global-*.md` — all global workflows
4. `.ai_ops/global/commands/*.md` — all global commands
5. `.ai_ops/global/skills/global-*` — all global skills
6. `.ai_ops/overrides/local-context.md` — project business context
7. `.agent/rules/project/*.md` — project runtime rules
8. `.agent/workflows/project/*.md` — project runtime workflows
9. `.agent/commands/project/*.md` — project commands
10. `.agent/skills/project/**/SKILL.md` — project skills

## Storage Rules (Non-Negotiable)

- Plans go in `docs/plans/`. NEVER in `.claude/plans/`, `.cursor/`, or any tool-specific path.
- Tasks go in `docs/tasks/`. NEVER in tool-specific task trackers.
- Documentation lives in `docs/`. NEVER only in chat context or agent memory.
- If the AI tool's default plan/task storage path conflicts with this rule, the agent MUST
  override the default and use the governed path.

## Before Any Implementation

1. Check `docs/plans/` for an existing plan covering the request.
2. Check `docs/tasks/` for existing tasks.
3. Create or update plan and tasks in the governed locations.
4. Run `npm run tasks:sync`.
5. Only then begin implementation.

## Violations

An AI agent that stores plans in tool-specific directories, skips task creation, or ignores
the load order is in governance violation. The agent must self-correct immediately when it
detects it has violated these rules.
```

### Updates to existing agent entrypoints

**Modify**: `central_ai_ops/global/global-CLAUDE.md` — add as first line after title:
```
CRITICAL: Follow centralized AI governance. Plans go in docs/plans/, tasks in docs/tasks/. 
Never use .claude/plans/ or any tool-specific storage. See @.ai_ops/global/rules/global-ai-agent-compliance.md.
```

**Modify**: `central_ai_ops/global/global-AGENTS.md` — same compliance preamble for Codex.

**Modify**: `central_ai_ops/global/global-codex.md` — same compliance preamble.

**Modify**: `central_ai_ops/global/global-opencode.md` — same compliance preamble.

**Modify**: `central_ai_ops/global/cursor/global-cursor-rule.mdc` — same compliance preamble for Cursor.

**Modify**: `central_ai_ops/global/global-MASTER.md` — add to Core Priorities section:
```
- CRITICAL: All AI agents must follow centralized governance without exception. 
  Plans in docs/plans/, tasks in docs/tasks/. Never use tool-specific storage paths.
  See @.ai_ops/global/rules/global-ai-agent-compliance.md.
```

---

## Skill 7: Prompt Sync Validator

**Problem**: Vigo maintains two versions of the system prompt — a condensed LLM-optimized version (`config/system-instructions.md`) and a human-readable version (`config/system-instructions-readable.md`). These drift apart silently. A `prompt:check-sync` script exists in Vigo but is not automated and currently fails with 2 mismatched sections.

**Purpose**: Ensure the condensed (LLM) prompt and readable (human) prompt contain the same semantic sections, key terms, safety flags, and behavioral rules.

**SKILL.md** defines:
- When to run: before any commit touching `config/system-instructions*.md`, during smoke suite, on demand
- What it checks:
  - Section headers present in both files (fuzzy-matched via canonical mapping)
  - Key safety terms and flags present in both (e.g., `HARD_VETO_FLAG`, `EMERGENCY_FLAG`, `polypharmacy`)
  - Configurable key-term list per project (via a `.ai_ops/overrides/prompt-sync-terms.json` or inline in the script)
  - Byte-size ratio stays within expected bounds (condensed should be 30-60% smaller)
- Inputs: `--condensed <path>` and `--readable <path>`, or auto-detected from `config/`
- Outputs: pass/fail with specific section/term mismatches listed

**prompt-sync.sh**: Generic script that accepts two prompt file paths and a key-terms config. Projects supply their own canonical header mappings and key-term lists. Vigo already has the logic in `scripts/check-prompt-sync.mjs` — the global skill extracts the pattern into a portable shell script that any project can use.

**Vigo integration**: Wire existing `npm run prompt:check-sync` into the pre-commit hook (when `config/system-instructions*.md` is staged) and the smoke suite. Fix the 2 current mismatches as part of the rollout.

---

## Implementation Sequence

### Phase 1: Create skill definitions and scripts in central_ai_ops

1. Create `central_ai_ops/global/skills/srw-audit/SKILL.md` + `srw-audit.sh`
2. Create `central_ai_ops/global/skills/migration-safety/SKILL.md` + `migration-safety.sh`
3. Create `central_ai_ops/global/skills/secret-scan/SKILL.md` + `secret-scan.sh`
4. Create `central_ai_ops/global/skills/doc-sync-check/SKILL.md` + `doc-sync-check.sh`
5. Create `central_ai_ops/global/skills/task-ref-check/SKILL.md` + `task-ref-check.sh`
6. Create `central_ai_ops/global/skills/governance-integrity/SKILL.md`
7. Create `central_ai_ops/global/skills/prompt-sync/SKILL.md` + `prompt-sync.sh`

### Phase 2: Project integration in Vigo

7. Re-run `ensure_governance_links.sh` to pick up new skills via existing symlink
8. Add `npm run audit:*` scripts to Vigo `package.json` that invoke the global scripts
9. Create `.ai_ops/overrides/doc-sync-triggers.json` with Vigo-specific path-to-doc mappings
10. Add `.githooks/pre-commit` that runs secret-scan + srw-audit + migration-safety in `--staged` mode
11. Add task-ref-check to `.githooks/commit-msg`
12. Add doc-sync-check to `.githooks/pre-push` (warn-only)
13. Add governance audit steps to `scripts/qa/run-smoke.mjs`

### Phase 3: Verify across environments

14. Test that Cursor loads SKILL.md files from `.agent/skills/global/*/SKILL.md`
15. Test that Codex/Agents.md references pick up the skills
16. Test that Claude Code loads skills via the CLAUDE.md load order
17. Run `npm run audit:all` in Vigo and verify clean output

## Files to Create (in central_ai_ops)

| File | Purpose |
|------|---------|
| `global/skills/srw-audit/SKILL.md` | SRW architecture audit skill definition |
| `global/skills/srw-audit/srw-audit.sh` | Portable SRW audit script |
| `global/skills/migration-safety/SKILL.md` | Migration safety skill definition |
| `global/skills/migration-safety/migration-safety.sh` | Portable migration safety script |
| `global/skills/secret-scan/SKILL.md` | Secret scan skill definition |
| `global/skills/secret-scan/secret-scan.sh` | Portable secret scanner script |
| `global/skills/doc-sync-check/SKILL.md` | Doc sync skill definition |
| `global/skills/doc-sync-check/doc-sync-check.sh` | Portable doc sync checker |
| `global/skills/task-ref-check/SKILL.md` | Task reference skill definition |
| `global/skills/task-ref-check/task-ref-check.sh` | Portable task ref checker |
| `global/skills/governance-integrity/SKILL.md` | Governance integrity skill definition |
| `global/skills/prompt-sync/SKILL.md` | Prompt sync skill definition |
| `global/skills/prompt-sync/prompt-sync.sh` | Portable condensed vs readable prompt sync checker |

## Files to Create/Modify (in Vigo)

| File | Change |
|------|--------|
| `package.json` | Add `audit:srw`, `audit:migrations`, `audit:secrets`, `audit:docs`, `audit:prompt-sync`, `audit:all` scripts |
| `.ai_ops/overrides/doc-sync-triggers.json` | Vigo-specific path-to-doc trigger mappings |
| `.githooks/pre-commit` | New: runs staged-mode secret-scan + srw-audit + migration-safety |
| `.githooks/commit-msg` | New: runs task-ref-check |
| `.githooks/pre-push` | Add doc-sync-check (warn-only) |
| `scripts/qa/run-smoke.mjs` | Add governance audit steps |

## Verification

1. `bash .agent/skills/global/srw-audit/srw-audit.sh --path supabase/functions/app-api/` passes on clean codebase
2. Intentionally add `.from()` to a handler → audit catches it
3. `bash .agent/skills/global/secret-scan/secret-scan.sh --staged` catches a test secret
4. `bash .agent/skills/global/migration-safety/migration-safety.sh --path supabase/migrations/` reports existing warnings correctly
5. All skills load correctly in Claude Code, Cursor, and Codex sessions via the symlink chain
6. `npm run audit:all` runs all skills and reports clean
7. Pre-commit hook blocks a commit with a handler DB query violation
