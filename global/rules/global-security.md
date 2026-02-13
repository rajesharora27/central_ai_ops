# Global Security Rules

## Pre-flight Security Rule (Mandatory)
Before coding, testing, committing, or generating release artifacts, complete this pre-flight check:

1. Secret exposure gate:
- No hardcoded secrets, tokens, API keys, passwords, certificates, or private keys in tracked files.
- No plaintext credentials in examples beyond explicit placeholders.
- Runtime secrets must come from environment/config providers, not source code.
- Reject commits that introduce `.env*` (except approved templates such as `.env.example`).

2. Prisma ORM compliance gate:
- Use Prisma Client APIs for DB access by default.
- Do not use `prisma.$queryRawUnsafe` or `prisma.$executeRawUnsafe`.
- Avoid string-built SQL and unparameterized raw queries.
- Any required raw query must be parameterized, reviewed, and justified in code comments.

3. CI/CodeQL readiness gate:
- Resolve security findings before completion; do not defer known high-risk issues.
- If a temporary exception is required, document risk, owner, and expiry date in the same PR.

Failure in any gate blocks the change until fixed.
