# Skill: Task Reference Validator

## Purpose

Ensure commit messages reference tracked task IDs for traceability.

## When to Run

- At commit time (commit-msg git hook)
- On demand for validation

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$1` | none | Path to commit message file (standard commit-msg hook arg) |
| `--message <text>` | none | Inline commit message to validate |
| `--tasks-dir <dir>` | `docs/tasks` | Directory containing task files |

## Checks

- Commit message contains `[FEAT-NNN]`, `[FIX-NNN]`, or `[CHORE-NNN]`
- Referenced task file exists in `docs/tasks/` or `docs/tasks/completed/`
- Warns if referencing a task with `status: done`
- Allows `[skip ci]` and merge commits without task references

## Outputs

- Exit 0: valid task reference found, or exempt commit type
- Exit 1: no task reference and not exempt
- Warning printed for done-task references

## Invocation

```bash
# As commit-msg hook:
bash .agent/skills/global/task-ref-check/task-ref-check.sh .git/COMMIT_EDITMSG

# Inline validation:
bash .agent/skills/global/task-ref-check/task-ref-check.sh --message "feat(chat): add import [FEAT-045]"
```
