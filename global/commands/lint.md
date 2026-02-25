# Global Command: Lint

Use this command when a user asks to "lint", "check formatting", or "run type checks".

## Intent
- Run linting and type-checking to catch style violations and type errors.
- Auto-fix safe formatting issues in changed files only.

## Required Workflow
1. Identify changed files from git status.
2. Run the project linter on changed files.
3. Run the type checker if available (e.g., `tsc --noEmit`, `mypy`).
4. Auto-fix safe issues (formatting, import ordering) in files you changed.
5. Report remaining violations that require manual attention.

## Guardrails
- Do not auto-fix formatting in files you did not change.
- Do not disable or suppress lint rules to make the check pass.
- Report unfixable issues with file path, line number, and rule name.
- If the linter or type checker cannot run, report the gap.

## Output Contract
- Files checked.
- Issues found and auto-fixed (count).
- Remaining violations with locations.
- Type errors with file paths and messages.
