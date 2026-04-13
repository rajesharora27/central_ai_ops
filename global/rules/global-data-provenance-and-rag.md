# Global Data Provenance And RAG

## Purpose

Governed repos must make it clear what AI knows, where it came from, and how fresh or trustworthy it is. Retrieval and grounding are architecture concerns, not invisible prompt tricks.

## Core Requirements

1. Define the allowed source domains for AI grounding or retrieval.
2. Keep provenance explicit when outputs depend on retrieved, indexed, or precomputed data.
3. Treat stale or weakly grounded context as a product risk that needs handling, not as an implementation detail.

## Retrieval And Grounding Expectations

When applicable, define:

- approved data sources
- freshness expectations
- retrieval scope and boundaries
- citation or source-reference policy
- behavior when no trustworthy grounding is available

## Validation Expectations

1. Retrieval-dependent features should test representative grounded and ungrounded scenarios.
2. If the feature claims factual grounding, evaluate stale-data and missing-source cases explicitly.
3. Do not let retrieval quietly expand beyond the approved source boundary without updating governance and docs.

## Operational Guidance

1. Log or trace which source set or retrieval mode served an answer when practical.
2. Keep data provenance rules provider-agnostic so different AI runtimes follow the same boundaries.
3. Prefer transparent user-facing wording when information is inferred, incomplete, or not fully grounded.
