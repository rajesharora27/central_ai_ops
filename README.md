# central_ai_ops

Central AI operations framework with a layered governance model that works across all major AI coding tools.

## How It Works

1. **Global baseline** in this repo (`global/`) — shared rules, workflows, commands, skills.
2. **Project-local context** in each project (`.ai_ops/overrides/local-context.md`) — project-specific docs, architecture, conventions.
3. **Runtime policy** in each project (`.agent/*/project/`) — project rules, workflows, commands.
4. **Compiled entrypoints** — `compile_governance.sh` assembles all layers into each AI tool's config file with actual content.

## Quick Start

### Bootstrap a new project

```bash
cd ~/dev/central_ai_ops

# Link governance structure into a project
scripts/link_ai_governance.sh --project /path/to/project

# Compile governance into AI tool entrypoints
scripts/compile_governance.sh --project /path/to/project
```

### Ensure governance is correct (run anytime)

```bash
# From project directory:
bash scripts/compile_governance.sh

# Or from central_ai_ops:
scripts/compile_governance.sh --project ~/dev/my-project

# Verify without changing files:
scripts/compile_governance.sh --project ~/dev/my-project --verify
```

**Run `compile_governance.sh` after any change to governance files** (global rules, project docs, local-context.md, project rules/workflows).

### Multiple projects at once

```bash
scripts/compile_governance.sh \
  --project ~/dev/project-a \
  --project ~/dev/project-b \
  --project ~/dev/project-c
```

## AI Tool Support

The compile script generates entrypoints for all major tools:

| AI Tool | Entrypoint File | Auto-loaded? |
|---------|----------------|-------------|
| Claude Code | `CLAUDE.md` | Yes — loaded automatically at project root |
| Cursor | `.cursorrules` | Yes — loaded automatically at project root |
| OpenAI Codex | `AGENTS.md` | Yes — loaded automatically at project root |
| GitHub Copilot | `.github/copilot-instructions.md` | Yes — loaded by Copilot |
| Gemini | `GEMINI.md` | Yes — loaded by Gemini |

Each entrypoint contains the **same compiled governance content**: global baseline + global rules/workflows/commands + project docs + project runtime policy. Every AI tool gets the full instruction set as actual text — no symlinks, no path references, no `@` includes.

### Tool-specific extras

| Tool | Additional Config | Notes |
|------|------------------|-------|
| Cursor | `.cursor/rules/*.mdc` | MDC rules for Cursor-specific behavior (glob-scoped) |
| Claude Code | `.claude/rules/*.md` | Additional rules beyond CLAUDE.md |
| Codex | `.vscode/settings.json` | `codex.instructions.path` and `codex.context.include` |
| OpenCode | `opencode.json` | Instruction file list |

These are set up by `link_ai_governance.sh` and don't need recompilation.

## Directory Structure

```
central_ai_ops/
  global/
    global-MASTER.md              # Canonical global baseline (load order, priorities)
    global-AGENTS.md              # Legacy wrapper → MASTER
    global-CLAUDE.md              # Legacy wrapper → MASTER
    rules/
      global-core-governance.md   # Core governance principles
      global-change-safety.md     # Change safety rules
      global-quality-gates.md     # Quality gate requirements
      global-security.md          # Mandatory security pre-flight
      global-conflict-resolution.md # Precedence rules
    workflows/
      global-application-blueprint.md   # Architecture contract template
      global-implementation-checklist.md # Implementation steps
    commands/
      commit.md, deploy.md, lint.md, release.md, security-audit.md, test.md
    skills/
      global-skill-authoring-guidelines.md
    cursor/
      global-cursor-rule.mdc      # Cursor-specific MDC rule
  scripts/
    compile_governance.sh         # ★ Compiles governance → entrypoints
    link_ai_governance.sh         # Links governance structure into projects
    bootstrap_link.sh             # Quick project bootstrap
    ensure_governance_links.sh    # Hook-safe sync for repos
    verify_governance_integrity.sh # Integrity verification
```

### In each bootstrapped project

```
project/
  CLAUDE.md                       # ← compiled (Claude Code)
  AGENTS.md                       # ← compiled (Codex)
  .cursorrules                    # ← compiled (Cursor)
  GEMINI.md                       # ← compiled (Gemini)
  .github/copilot-instructions.md # ← compiled (Copilot)
  .ai_ops/
    global/                       # → symlink to central_ai_ops/global
    overrides/
      local-context.md            # Project-specific context (@refs to docs)
  .agent/
    rules/global/                 # → symlink to central global rules
    rules/project/                # Project-specific rules
    workflows/global/             # → symlink to central global workflows
    workflows/project/            # Project-specific workflows
    commands/global/              # → symlink to central global commands
    commands/project/             # Project-specific commands
  docs/
    vigo.md (or equivalent)       # Project documentation (referenced from local-context.md)
    CONTRIBUTING.md               # Dev conventions
```

## Governance Layers and Precedence

```
┌─────────────────────────────────────────────┐
│  3. Project Runtime Policy (highest)        │  .agent/rules/project/*
│     Project rules override everything       │  .agent/workflows/project/*
├─────────────────────────────────────────────┤
│  2. Project Business Context                │  .ai_ops/overrides/local-context.md
│     @refs to docs/*.md                      │  → docs/vigo.md, docs/CONTRIBUTING.md
├─────────────────────────────────────────────┤
│  1. Global Baseline (lowest)                │  global-MASTER.md
│     Global rules, workflows, commands       │  global/rules/*, workflows/*, commands/*
└─────────────────────────────────────────────┘
```

Project-local content overrides global content on conflict.

## Workflow

### First-time setup

```bash
# 1. Bootstrap project structure (symlinks + scaffolds)
cd ~/dev/central_ai_ops
scripts/link_ai_governance.sh --project ~/dev/my-project

# 2. Edit project context
#    - Write your docs (docs/vigo.md, docs/CONTRIBUTING.md, etc.)
#    - Update .ai_ops/overrides/local-context.md with @refs to your docs
#    - Add project rules in .agent/rules/project/

# 3. Compile into entrypoints
scripts/compile_governance.sh --project ~/dev/my-project

# 4. Verify
scripts/compile_governance.sh --project ~/dev/my-project --verify
```

### After changing governance files

```bash
# Recompile entrypoints
scripts/compile_governance.sh --project ~/dev/my-project

# Or from inside the project:
bash scripts/compile_governance.sh
```

### Multi-IDE clone (canonical project source)

```bash
# Link from canonical project repo to an IDE-specific clone
scripts/link_ai_governance.sh \
  --project ~/dev/cursor-clone/my-project \
  --project-source ~/dev/my-project

# Then compile
scripts/compile_governance.sh --project ~/dev/cursor-clone/my-project
```

## Security Gate

`global/rules/global-security.md` defines mandatory pre-flight checks:
- Secret exposure checks
- ORM compliance (parameterized queries)
- CI/CodeQL readiness

## Governance Change Rule

When updating governance artifacts under `global/`:
1. Update `global/global-MASTER.md` if load paths change.
2. Run `scripts/verify_governance_integrity.sh`.
3. Recompile all active projects: `scripts/compile_governance.sh --project <each>`.
