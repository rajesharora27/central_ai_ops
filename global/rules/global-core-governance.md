# Global Core Governance

- Respect repository boundaries and existing conventions.
- Keep implementations deterministic and observable.
- Do not hide failures; surface blockers with concrete evidence.
- Prefer explicit contracts over implicit coupling.
- Keep tool-specific wrappers thin and delegate policy to shared rule files.
- Reuse existing code before creating new pathways. Avoid redundancy and centralize shared logic when appropriate.
- Keep code simple, readable, and formatted to the project's conventions.
- Validate from the user's perspective when behavior changes; technical correctness without a working user flow is not sufficient.
- At session start and every context refresh, read `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, `/docs/APPLICATION_BLUEPRINT.md`, and `/docs/<appname>.md` when those files exist in the project. `<appname>` is the repository or app-folder name.
- Before marking work complete, update every impacted project document and remove stale guidance from the canonical docs set.
