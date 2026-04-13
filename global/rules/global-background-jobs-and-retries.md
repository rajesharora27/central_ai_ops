# Global Background Jobs And Retries

## Purpose

Async AI and communication workloads must be reliable at scale. Governed repos should treat retries, fan-out, rate limits, and idempotency as first-class architecture concerns.

## Core Requirements

1. Background jobs and fan-out flows should prefer queue-based or paced execution over unbounded burst behavior.
2. Retry logic must be bounded and should use backoff where the integration or provider can throttle.
3. Operations that may run more than once must be idempotent or explicitly guarded against duplication.

## Required Controls

When applicable, define:

- retry policy and max attempts
- backoff strategy
- idempotency keys or dedupe rules
- rate-limit awareness
- partial-failure reporting
- dead-letter or manual recovery path

## Fan-Out And External Providers

1. Bulk email, summaries, notifications, and async inference must respect provider throughput limits.
2. One bad recipient or malformed item should not poison the entire job when partial success is acceptable.
3. Jobs should report totals, success counts, skip counts, and failures in a way operators can understand.

## Deployment And Scale Readiness

1. If a feature introduces a new async or batch pathway, update deploy/test guidance so that pathway is validated before release.
2. Short-term pacing is acceptable as an interim mitigation, but scaling risks must be documented when queueing or batching is still missing.
