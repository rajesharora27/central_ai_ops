# Global AI Safety Governance

## Purpose

Governed repos must treat AI safety as a product requirement, not an afterthought. AI outputs should be constrained, reviewable, and capable of degrading safely when confidence, policy alignment, or user safety is uncertain.

## Core Requirements

1. Define the safety expectations for each AI feature before release.
2. Treat hallucinations, unsafe instructions, sensitive-topic mishandling, and overconfident falsehoods as product failures, not only model quirks.
3. Prefer explicit safe fallback behavior over silent failure or fabricated certainty.

## Safety Controls

Where applicable, projects should define:

- disallowed or restricted output categories
- escalation rules for high-risk topics or sensitive decisions
- confidence or certainty boundaries
- fallback wording when the system cannot answer safely
- user-visible recovery or support paths when the AI must defer

## Validation Expectations

1. Safety-sensitive AI flows should include targeted safety or abuse cases in evaluation coverage.
2. If a feature can produce recommendations with material user impact, validate that it fails safely when context is incomplete or ambiguous.
3. Do not rely on prompt wording alone as the only safety control when additional application constraints are required.

## Operational Guidance

1. Log safety-triggered fallbacks or escalations in a structured, privacy-aware way.
2. Document any high-risk areas where human review or additional approval is required.
3. Keep safety expectations portable across providers and response tiers.
