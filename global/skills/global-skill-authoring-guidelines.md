# Global Skill Authoring Guidelines

## Definition
A Skill is a stateless, narrowly scoped execution helper. Skills receive inputs, perform
a deterministic computation or transformation, and return outputs. They must not perform
I/O, hold state between invocations, or embed policy decisions.

## Structure
Every skill file must contain:
1. **Purpose** — one sentence describing what the skill does.
2. **Inputs** — named parameters with types and constraints.
3. **Outputs** — return shape with types.
4. **Failure modes** — enumerated error conditions and how they surface.
5. **Example** — at least one concrete input/output pair.

## Rules
- Keep skills narrowly scoped and reusable across projects.
- Put policy in Rules, not in Skills. Skills execute; Rules decide.
- No side effects: no database writes, no file I/O, no network calls.
- No project-specific assumptions in global skills.
- Skills must be idempotent: same inputs always produce same outputs.
- Keep dependencies minimal — prefer standard library over external packages.

## Testing
- Each skill should have unit tests covering happy path, edge cases, and each failure mode.
- Test skills in isolation — mock nothing, since skills should have no external dependencies.

## Naming
- File: `<DomainAction>Skill.ts` (e.g., `RetentionCalculationSkill.ts`).
- SKILL.md descriptor: place in `.agent/skills/project/<domain>/SKILL.md`.

## Anti-patterns
- Skill that reads from database — move I/O to the calling Workflow.
- Skill that checks permissions — move policy to a Rule.
- Skill with conditional logic based on environment — parameterize instead.
