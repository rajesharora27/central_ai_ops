# Global Task Governance

## Purpose

Every repo-changing request must be traceable through a plan, a task set, and the generated task hub. This preserves continuity across AI agents, sessions, and human contributors.

## Mandatory Planning Preflight

Before any repo-tracked implementation change:

1. Check `docs/plans/` and `docs/tasks/` for existing coverage.
2. Reuse existing plan/task coverage when it already matches the request.
3. If coverage is missing or incomplete, create or update the plan in `docs/plans/`.
4. Create or update the full task breakdown in `docs/tasks/`.
5. Run `npm run tasks:sync` so `docs/TODO.md` reflects the current plan/task tree.
6. Only then begin implementation.

This applies to features, fixes, chores, refactors, migrations, deployment-script changes, docs changes with repo impact, and patch-by-patch delivery. It does not apply to pure analysis or Q&A with no repo mutation.

## Task Lifecycle

### 1. Reuse First

1. Reuse existing plan/task coverage when it already matches the request.
2. Avoid duplicate tasks for the same implementation track.
3. If a request will ship in patches, create or update the full patch task set before patch 1 starts.

### 2. Creation

When a user requests repo-changing work:

1. Check `docs/tasks/` for an existing task that covers the request.
2. If none exists, create a new task file in `docs/tasks/`.
3. Use the next available ID by scanning existing files.
4. Follow the frontmatter format below.
5. Ensure the related plan exists in `docs/plans/`.
6. Run `npm run tasks:sync` to update `docs/TODO.md`.

### 3. ID Convention

| Prefix | When to use | Example |
|--------|-------------|---------|
| `FEAT-XXX` | New feature or capability | `FEAT-042-gamification.md` |
| `FIX-XXX` | Bug fix | `FIX-015-chat-scroll.md` |
| `CHORE-XXX` | Maintenance, docs, DevOps, refactoring | `CHORE-012-expo-upgrade.md` |

Legacy `T-XXX` IDs are still valid and do not need migration. New tasks use the typed format.

### 4. Naming Conventions

**Title format**: Human-readable Title Case. Never include the task ID or type prefix in the title.

**File naming**: `{TYPE}-{NNN}-{kebab-description}.md`

- Task: `docs/tasks/FEAT-042-gamification.md`
- Plan: `docs/plans/FEAT-042-gamification.md` or `docs/plans/{descriptive-name}.md`

### 5. Frontmatter Format (Mandatory)

```yaml
---
id: FEAT-042
title: "Short descriptive title"
type: feat          # feat | fix | chore
status: in_progress # planned | in_progress | done | backlog
priority: high      # high | medium | low
depends_on: []      # list of task IDs this depends on
plan: plan-name.md  # required for repo-changing implementation work
created: 2026-03-30
updated: 2026-03-30
---
```

### 6. Required Task Body Details

Each implementation task should describe enough context for another agent or developer to continue the work safely. Include, when relevant:

- objective / problem statement
- user or operational impact
- affected existing files
- new files to be introduced
- acceptance criteria
- validation plan

### 7. Status Transitions

```text
planned -> in_progress -> done
planned -> backlog
backlog -> in_progress
```

### 8. Completion

When a task is finished:

1. Update every impacted source-of-truth project document.
2. Set `status: done` and update the `updated` date.
3. Move the task file from `docs/tasks/` to `docs/tasks/completed/`.
4. Run `npm run tasks:sync` so `docs/TODO.md` shows the completed/archive state.

### 9. Plans

Plans live in `docs/plans/` and are linked from the task's `plan:` frontmatter field. For repo-changing implementation work, a plan is mandatory. Plans describe the "how"; tasks describe the "what".

## Rules for AI Agents

1. **Always check existing tasks first** - do not create duplicates.
2. **Always use `docs/tasks/`** - never create task files in tool-specific directories.
3. **Always include frontmatter** - tasks without frontmatter break the generator.
4. **Always create or update the plan first** - then create or update the task set, then run `npm run tasks:sync`.
5. **Always update status** - mark `in_progress` when starting, `done` when finishing.
6. **Always capture enough detail for handoff** - impact, files touched, new files, and validation should be obvious from the task.
7. **Commit messages should reference task IDs** - `feat(chat): add streaks [FEAT-042]`.
8. **Never edit `docs/TODO.md` by hand** - it is auto-generated.
9. **This workflow applies equally to Codex, Claude, Cursor, Gemini, Copilot, Antigravity, and human contributors** - tool choice does not change the task workflow.

## Quick Reference

```bash
# See all active tasks
grep -l "status: in_progress" docs/tasks/*.md

# See all planned work
grep -l "status: planned" docs/tasks/*.md

# Regenerate TODO.md
npm run tasks:sync

# Find commits for a task
git log --grep="FEAT-042"
```
