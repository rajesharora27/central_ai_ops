# Global Privacy Retention And Deletion

## Purpose

AI systems must handle user data with explicit retention, deletion, and minimization rules. Governed repos should not let prompts, memory, logs, or derived artifacts quietly become unbounded or privacy-unsafe.

## Core Requirements

1. Minimize the sensitive data sent to models, stored in logs, or retained in memory.
2. Define how deletion, retention, and export expectations apply to AI-related data paths.
3. Treat privacy-aware data handling as a baseline requirement across providers and environments.

## Data Handling Expectations

Projects should define, when relevant:

- what categories of user data can be sent to AI providers
- what must be redacted, minimized, or excluded
- retention windows for prompts, summaries, logs, and derived artifacts
- deletion and export behavior for AI-related user data
- provider-specific privacy constraints when applicable

## Validation Expectations

1. If an AI feature stores user-derived memory, summaries, or retrieved context, validate that deletion and retention behavior remains coherent.
2. If privacy or retention behavior cannot yet be fully enforced, treat that as documented product risk rather than silent omission.
3. Keep privacy-related rules compatible with project-local compliance requirements.

## Operational Guidance

1. Avoid logging secrets, credentials, or unnecessary raw personal data.
2. Prefer shared redaction/minimization helpers over ad hoc filtering.
3. Keep retention and deletion rules documented in the project’s operational docs, not only in implementation code.
