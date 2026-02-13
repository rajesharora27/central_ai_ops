# Global Conflict Resolution

Precedence order (lowest to highest):
1. Global baseline in `.ai_ops/global/global-MASTER.md` and `.ai_ops/global/rules/*`
2. Project business context in `.ai_ops/overrides/local-context.md`
3. Project local runtime rules in `.agent/rules/project/*`

When conflict is detected, apply the higher-precedence project rule.
