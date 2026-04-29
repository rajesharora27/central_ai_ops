# Skill: Task Hub Sync

## Purpose

Keep the Task Hub (`docs/TODO.md`, `docs/plans/`, `docs/tasks/`) consistent and up to date by validating, archiving, and regenerating after any task-related change.

## When to Run

- **After completing any task** — archive to `completed/`, regenerate TODO.md
- **After creating a new plan or task** — regenerate TODO.md
- **After updating task status** — regenerate TODO.md
- **Before committing task-related changes** — validate integrity
- **Periodic governance audit** — find stale or misplaced tasks

## What "Task Hub" Means

The Task Hub is the system of three directories plus one generated index:

| Component | Path | Role |
|-----------|------|------|
| Plans | `docs/plans/` | Implementation designs — one per initiative |
| Active tasks | `docs/tasks/` | In-flight work with YAML frontmatter |
| Completed tasks | `docs/tasks/completed/` | Archived done work |
| Index | `docs/TODO.md` | Auto-generated from frontmatter. Never edit manually. |

Governed by: `.ai_ops/global/rules/global-task-governance.md`

## Operations

### 1. validate — Check task hub integrity

Checks performed:
- Every file in `docs/tasks/` has valid YAML frontmatter (`id`, `title`, `status`)
- No file in `docs/tasks/` has `status: done` or `status: completed` (should be in `completed/`)
- Every `plan:` reference in a task points to an existing file in `docs/plans/`
- Every `depends_on:` ID maps to a real task file
- File naming matches convention: `{TYPE}-{NNN}-{kebab-description}.md`
- No non-standard status values (allowed: `planned`, `in_progress`, `done`, `backlog`, `pending`)
- `docs/TODO.md` header says "Auto-generated" (not hand-edited)

### 2. archive — Move done tasks to completed/

Steps:
1. Find all files in `docs/tasks/` where frontmatter `status` is `done` or `completed`
2. Normalize `status: completed` → `status: done`
3. Move each file to `docs/tasks/completed/`
4. Run `npm run tasks:sync` to regenerate `docs/TODO.md`
5. Report how many files were archived

### 3. sync — Regenerate the Task Hub index

Steps:
1. Run `npm run tasks:sync`
2. Verify `docs/TODO.md` was regenerated (check timestamp line at bottom)
3. Report active/backlog/done counts

### 4. complete — Mark a task done and archive it

Steps:
1. Set `status: done` and `updated: <today>` in the task's frontmatter
2. Move file from `docs/tasks/` → `docs/tasks/completed/`
3. Run `npm run tasks:sync`

### 5. create — Create a new task with valid frontmatter

Steps:
1. Determine next available ID for the given type prefix (FEAT/FIX/CHORE)
2. Create file in `docs/tasks/` with required frontmatter fields
3. Run `npm run tasks:sync`

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `operation` | `validate` | One of: `validate`, `archive`, `sync`, `complete`, `create` |
| `--task-id` | none | Task ID for `complete` operation (e.g., `FEAT-042`) |
| `--type` | none | Task type for `create`: `feat`, `fix`, `chore` |
| `--title` | none | Task title for `create` |
| `--plan` | none | Optional plan reference for `create` |
| `--tasks-dir` | `docs/tasks` | Task directory |
| `--plans-dir` | `docs/plans` | Plans directory |

## Outputs

- Exit 0: operation succeeded, hub is consistent
- Exit 1: validation failures found, or operation error
- Stdout: summary of actions taken or issues found

## AI Agent Integration

All AI agents (Claude, Cursor, Codex, Gemini, Copilot) MUST use this skill's mental model when working with tasks. Specifically:

1. **Before starting work**: Check if a plan and task exist. If not, create them.
2. **After finishing work**: Mark the task `done`, run archive, run sync.
3. **Never edit `docs/TODO.md` manually** — always use sync.
4. **Never leave done tasks in `docs/tasks/`** — always archive.
5. **Always include frontmatter** with at minimum: `id`, `title`, `type`, `status`, `created`.

## Invocation

```bash
# Validate task hub integrity
bash .agent/skills/global/task-hub-sync/task-hub-sync.sh validate

# Archive all done tasks and regenerate
bash .agent/skills/global/task-hub-sync/task-hub-sync.sh archive

# Regenerate TODO.md
bash .agent/skills/global/task-hub-sync/task-hub-sync.sh sync

# Mark a task complete and archive it
bash .agent/skills/global/task-hub-sync/task-hub-sync.sh complete --task-id FEAT-042
```

## Example

```
$ bash .agent/skills/global/task-hub-sync/task-hub-sync.sh validate

Task Hub Validation
  Active tasks:  42
  Completed:     187
  Plans:         98
  
  Issues found:
    WARN  docs/tasks/FIX-213-chat-rich-section-heading-recovery.md — status 'completed' should be 'done'
    ERROR docs/tasks/FEAT-200-imperial-water-logging.md — status 'done' but still in active directory
    
  2 issues found. Run 'archive' to fix.
```
