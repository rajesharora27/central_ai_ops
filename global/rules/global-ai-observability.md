# Global AI Observability

## Purpose

AI behavior must be diagnosable in production. Governed repos should emit enough structured telemetry to understand prompt execution, provider/model choices, user-visible failures, and operational cost/latency.

## Core Requirements

1. AI flows should emit structured logs or trace data for the request path, not only free-form error strings.
2. Observability should capture the metadata needed to diagnose failures without leaking secrets or sensitive user content unnecessarily.
3. User-visible degraded states should be distinguishable from successful responses in telemetry.

## Minimum Telemetry Expectations

Where applicable, capture:

- feature or action name
- provider and model used
- tier or strategy used
- latency and retry count
- tool-calling attempts and failures
- structured error category
- token/cost metrics when available
- rollout or feature-flag state when relevant

## Operational Guidance

1. Prefer structured fields over human-only log messages.
2. Keep logs safe: do not emit secrets, raw credentials, or sensitive payloads that the product would not normally retain.
3. When full prompts or responses cannot be logged, still log enough metadata to diagnose the execution path.
4. Ensure background jobs and fan-out flows emit their own result counts and failure details.

## Release And Incident Support

Observability should support:

1. identifying which provider/model handled a bad reply
2. distinguishing parser/render failures from model-generation failures
3. spotting latency, cost, or rate-limit regressions after rollout
4. tracing user-facing degraded behavior during incidents
