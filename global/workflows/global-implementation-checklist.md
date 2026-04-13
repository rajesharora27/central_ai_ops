# Global Implementation Checklist

1. At startup and on context refresh, read `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, `/docs/APPLICATION_BLUEPRINT.md`, and `/docs/<appname>.md` when present. `<appname>` is the repository or app-folder name.
2. Confirm scope and impacted files.
3. Reuse or create the implementation plan in `docs/plans/`.
4. Reuse or create the full task set in `docs/tasks/`.
5. Run `npm run tasks:sync` so `docs/TODO.md` is current before coding.
6. Check whether the needed logic already exists and can be reused or moved into a shared module/service.
7. Apply minimal edits in the correct SRW layer.
8. Add unit tests for new logic and update integration tests when the change crosses module or API boundaries.
9. Validate the user-facing flow when the change affects behavior, not only the low-level code path.
10. Run targeted checks/tests plus the required project quality gates.
11. Before marking the task complete, update every impacted source-of-truth doc, especially `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, `/docs/APPLICATION_BLUEPRINT.md`, and `/docs/<appname>.md`.
12. Move completed task files into `docs/tasks/completed/`, rerun `npm run tasks:sync`, and verify no stale references or backup artifacts remain.
13. Summarize changes, validation results, and any residual risks.
