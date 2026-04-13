# Global Memory And Context Governance

## Purpose

Governed repos must control what enters AI context, how long it stays there, and how it is reused. Memory and summarization should improve continuity without causing stale, misleading, or privacy-unsafe behavior.

## Core Requirements

1. Define which categories of data are allowed into model context, summary memory, and long-lived memory.
2. Keep context assembly deterministic and reviewable where practical.
3. Prevent stale summaries or irrelevant history from silently overriding newer user state.

## Context Hygiene Rules

Projects should define, when relevant:

- allowed context sources
- retention or reuse window
- summary refresh rules
- precedence between recent events and older memory
- rules for excluding sensitive or irrelevant content

## Validation Expectations

1. Test or evaluate context-heavy flows for chronology drift, stale-memory reuse, and incorrect replay of prior state.
2. If summaries or memory artifacts are reused across sessions, ensure the update rules are explicit.
3. Keep user-visible timestamps, prompt-internal anchors, and storage metadata separated unless the product explicitly requires them.

## Operational Guidance

1. Context handling should be shared and centralized rather than duplicated across clients or providers.
2. Memory features should support cleanup or regeneration when summaries drift or become stale.
3. Keep memory and context policy portable across AI environments.
