# Global Command: Commit

Use this command when a user asks to "commit", "prepare a commit", or "commit and push".

## Intent
- Produce a safe, auditable commit for the current task.
- Preserve repo policy gates and avoid unrelated changes.

## Required Workflow
1. Inspect scope with `git status --short` and relevant diffs.
2. Stage only task-related files.
3. Verify required repo gates for staged changes (hooks, lint, typecheck, tests, audits, migration checks as applicable).
4. Write a conventional, scoped commit message based on actual changes.
5. Commit once checks pass.
6. Push only when user explicitly asked for push/publish.

## Guardrails
- Do not rewrite history unless the user asked (`rebase`, `commit --amend`, force-push).
- Do not include secrets or runtime env files.
- Do not stage unrelated dirty-tree changes.
- If unrelated changes block commit, ask whether to continue with path-limited staging.

## Output Contract
- Summarize staged files.
- Report checks run (or gaps if a check could not run).
- Return commit hash and branch.
- Return push result when push was requested.
