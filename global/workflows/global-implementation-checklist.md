# Global Implementation Checklist

1. At startup and on context refresh, read `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, `/docs/APPLICATION_BLUEPRINT.md`, and `/docs/<appname>.md` when present. `<appname>` is the repository or app-folder name.
2. Confirm scope and impacted files.
3. Reuse or create the implementation plan in `docs/plans/`.
4. Reuse or create the full task set in `docs/tasks/`.
5. Run `npm run tasks:sync` so `docs/TODO.md` is current before coding.
6. Check whether the needed logic already exists and can be reused or moved into a shared module/service.
7. Apply minimal edits in the correct SRW layer.
8. For AI behavior changes, define or update the impacted evaluation set, provider/runtime assumptions, and observability hooks before treating the implementation as complete.
9. For AI behavior changes, define or update the relevant safety constraints, output contract, provenance/context expectations, and privacy/retention considerations before treating the implementation as complete.
10. For release-sensitive changes, confirm incident response, rollout, parity, performance/cost, and migration implications before treating the work as complete.
11. Add unit tests for new logic and update integration tests when the change crosses module or API boundaries.
12. Validate the user-facing flow when the change affects behavior, not only the low-level code path.
13. For release-sensitive AI changes, confirm rollout and fallback expectations, including kill switches or degraded-mode behavior where relevant.
14. Run targeted checks/tests plus the required project quality gates.
15. Before marking the task complete, update every impacted source-of-truth doc, especially `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, `/docs/APPLICATION_BLUEPRINT.md`, and `/docs/<appname>.md`.
16. Move completed task files into `docs/tasks/completed/`, rerun `npm run tasks:sync`, and verify no stale references or backup artifacts remain.
17. Summarize changes, validation results, and any residual risks.
