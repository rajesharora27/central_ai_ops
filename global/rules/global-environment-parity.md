# Global Environment Parity

## Purpose

Governed repos should behave consistently enough across local, test, stage, prod, and cross-agent environments that validation results can be trusted. Parity does not mean identical infrastructure, but it does mean predictable behavior.

## Core Requirements

1. Keep environment-specific differences explicit and documented.
2. Validate feature flags, provider/runtime configuration, prompts, and deployment assumptions across the environments that matter for release.
3. Treat “works here, fails there” behavior as a governance concern when caused by hidden configuration drift.

## Parity Expectations

Projects should define, when relevant:

- config differences by environment
- allowed feature-flag differences
- provider/model differences
- data-shape or service availability differences
- required pre-promotion checks between stage and production

## Operational Guidance

1. Prefer shared configuration contracts over ad hoc environment-specific logic.
2. If perfect parity is not possible, document the known gaps and their release risk.
3. Cross-agent usage should follow the same underlying governance artifacts even when IDE/runtime wrappers differ.
