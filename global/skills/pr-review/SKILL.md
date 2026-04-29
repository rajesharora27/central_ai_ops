# Skill: PR Review

## Purpose

Perform a structured, efficient pull request review. Produces consistent, actionable output across projects.

## When to Run

- When asked to review a PR, review changes, check a diff, or give feedback before merging
- When running the `/review` command or asking "review this PR"

## Workflow

### Step 1 — Get the diff efficiently

```bash
git diff --stat main...HEAD   # file summary first — decide what to read
git diff main...HEAD          # targeted diff of changes
```

Read only changed files. Do not read unchanged files for context unless a specific finding requires it.

### Step 2 — Review checklist

Check each concern silently. Only report findings, not "checked and OK" items.

- **Logic correctness** — does it do what it claims?
- **Error handling** — are failure paths covered?
- **Security** — injection, auth bypass, data exposure risks?
- **Performance** — N+1 queries, missing indexes, unbounded loops?
- **Tests** — are new code paths tested? Are existing tests updated for changed behavior?
- **Breaking changes** — does this change public interfaces, contracts, or migration paths?
- **SRW compliance** — no inline I/O in orchestration layers, no policy in execution helpers (when applicable)
- **Migration safety** — additive DDL only, RLS on new tables, no destructive commands (when applicable)
- **Doc sync** — do changed files trigger documentation updates per project rules?

### Step 3 — Output format

Use this exact structure. Keep total output under 400 tokens unless a finding requires detail.

```
### Summary
1-2 sentences: what does this PR do?

### Blockers (must fix before merge)
- File:line — issue description

### Suggestions (should fix)
- File:line — suggestion

### Looks Good
- Specific things done well (at least one)

### Questions
- Anything unclear that needs author input
```

## Constraints

- Do not restate the diff back to the user
- Do not comment on style or formatting if a linter handles it
- Do not read entire files when only a function changed
- Prefer one clear sentence over a paragraph of hedging

## Inputs

| Parameter | Default | Description |
| --------- | ------- | ----------- |
| base branch | `main` | Branch to diff against |

## Outputs

Structured review in the format above. Exit with a clear recommendation: approve, request changes, or needs discussion.
