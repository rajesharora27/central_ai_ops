# Global Branch Strategy

## Purpose

Every feature, fix, or chore must be developed on a dedicated branch. Direct commits to the main branch risk breaking shared state and make rollbacks difficult.

## Core Requirements

1. Before starting implementation, create a new branch from the current main branch.
2. Branch names must follow the pattern `{type}/{short-description}` using the task type prefix:
   - `feat/add-user-search`
   - `fix/chat-scroll-regression`
   - `chore/upgrade-expo-sdk`
3. Never commit directly to `main` or `master` unless the user explicitly authorizes it.
4. One branch per task. Do not mix unrelated work on the same branch.

## Workflow

1. Fetch latest main: `git fetch origin main`
2. Create and switch to a new branch: `git checkout -b {type}/{short-description}`
3. Implement, commit, and push the branch.
4. Merge back to main only through a pull request or explicit user instruction.

## Guardrails

- If already on a feature branch that matches the current task, reuse it instead of creating another.
- If the user says "just commit this" without specifying a branch, ask whether to create a new branch or commit to the current one.
- Do not delete branches after merge unless the user requests it.
