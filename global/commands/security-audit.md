# Global Command: Security Audit

Use this command when a user asks to "run security checks", "audit security", or "check for vulnerabilities".

## Intent
- Run security checks against the current codebase to surface vulnerabilities.
- Enforce the mandatory pre-flight gates from global-security.md.

## Required Workflow
1. **Secret exposure check**: Scan for hardcoded secrets, tokens, API keys, passwords, and certificates in tracked files.
2. **Dependency vulnerability check**: Run the package manager's audit command (e.g., `npm audit`, `pip audit`).
3. **ORM compliance check**: Verify no unsafe raw queries (e.g., `$queryRawUnsafe`, `$executeRawUnsafe`).
4. **Static analysis**: Run available static analysis tools (CodeQL, ESLint security plugins).
5. Summarize findings by severity (critical, high, medium, low).

## Guardrails
- Block on critical or high severity findings; these must be resolved before proceeding.
- Document any temporary exceptions with risk description, owner, and expiry date.
- Do not suppress or ignore findings to make the audit pass.
- If an audit tool cannot run, report the gap.

## Output Contract
- Findings by severity with file paths and descriptions.
- Dependencies flagged with CVE identifiers.
- ORM compliance status.
- Exceptions documented (if any) with owner and expiry.
- Overall audit status (pass/fail).
