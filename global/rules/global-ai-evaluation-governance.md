# Global AI Evaluation Governance

## Purpose

Every AI feature or materially changed AI behavior must ship with explicit evaluation coverage, not just implementation tests. Evaluation is how governed repos prove the model behavior is acceptable for users before release.

## Core Requirements

1. Define an evaluation set for every new AI capability and every meaningful prompt/model/tooling change.
2. Keep evaluation artifacts in the repo or in a project-approved canonical location, not only in chat history or ad hoc notebooks.
3. Treat evaluation failures as release blockers when the affected behavior is part of the requested change.
4. Keep evaluation guidance provider-agnostic so the same rule applies across OpenAI, Anthropic, Google, Copilot-hosted, local, and future providers.

## Minimum Evaluation Contract

Each governed project should define, for the impacted AI feature:

- the task or user flow being evaluated
- representative prompts/examples
- expected output characteristics or pass/fail criteria
- regression cases for previously fixed failures
- safety or policy checks where relevant

If a change affects an existing AI flow, update the existing evaluation set instead of creating parallel duplicated coverage.

## Required Evaluation Scenarios

When applicable, evaluations should cover:

1. happy-path representative behavior
2. edge cases and ambiguous prompts
3. previously observed failures or regressions
4. formatting or output-contract compliance
5. safety/policy compliance for the domain
6. tool-calling or retrieval behavior where relevant

## Release Gate

1. Do not ship an AI change if the impacted evaluation set regresses against the expected baseline.
2. If a repo lacks full automated evaluation infrastructure, require at least a documented targeted evaluation run using canonical examples before release.
3. If evaluation cannot be run, report that gap explicitly and treat it as release risk rather than silently proceeding.

## Reuse And Maintenance

1. Reuse existing eval suites and golden examples before adding new parallel ones.
2. Keep evaluation artifacts small, reviewable, and easy to update.
3. Retire stale eval cases only when they no longer reflect product behavior or policy.
