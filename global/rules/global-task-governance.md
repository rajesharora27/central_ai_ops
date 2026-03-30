# Global Task Governance

## Purpose

Every piece of work — features, fixes, chores — is tracked as a task file in `docs/tasks/`. This ensures continuity across AI agents, sessions, and contributors.

## Task Lifecycle

### 1. Creation

When a user requests work that will take more than a trivial edit:

1. Check `docs/tasks/` for an existing task that covers the request
2. If none exists, create a new task file in `docs/tasks/`
3. Use the next available ID by scanning existing files
4. Follow the frontmatter format below
5. Run `npm run tasks:sync` to update `docs/ToDo.md`

### 2. ID Convention

| Prefix | When to use | Example |
|--------|-------------|---------|
| `FEAT-XXX` | New feature or capability | `FEAT-042-gamification.md` |
| `FIX-XXX` | Bug fix | `FIX-015-chat-scroll.md` |
| `CHORE-XXX` | Maintenance, docs, DevOps, refactoring | `CHORE-012-expo-upgrade.md` |

Legacy `T-XXX` IDs are still valid and don't need migration. New tasks use the typed format.

### 3. Frontmatter Format (Mandatory)

```yaml
---
id: FEAT-042
title: "Short descriptive title"
type: feat          # feat | fix | chore
status: in_progress # planned | in_progress | done | backlog
priority: high      # high | medium | low
depends_on: []      # list of task IDs this depends on
plan: plan-name.md  # optional, links to docs/plans/
created: 2026-03-30
updated: 2026-03-30
---
```

### 4. Status Transitions

```
planned → in_progress → done
planned → backlog (deferred)
backlog → in_progress (resumed)
```

### 5. Completion

When a task is finished:
1. Set `status: done` and update the `updated` date
2. Move the file from `docs/tasks/` to `docs/tasks/completed/`
3. Run `npm run tasks:sync` to regenerate `docs/ToDo.md`

### 6. Plans

Plans live in `docs/plans/` and are linked from the task's `plan:` frontmatter field. A plan is optional — small tasks don't need one. Plans describe the "how", tasks describe the "what".

## Rules for AI Agents

1. **Always check existing tasks first** — don't create duplicates
2. **Always use `docs/tasks/`** — never create task files in tool-specific directories
3. **Always include frontmatter** — tasks without frontmatter break the generator
4. **Always update status** — mark `in_progress` when starting, `done` when finishing
5. **Always run `npm run tasks:sync`** after creating or updating task files
6. **Commit messages should reference task IDs** — `feat(chat): add streaks [FEAT-042]`
7. **Never edit `docs/ToDo.md` by hand** — it is auto-generated

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
