# Global Architecture: SRW Compliance

All applications developed within this ecosystem MUST adhere to the **Skill, Rules, and Workflow (SRW)** architecture. This paradigm ensures that logic is portable, testable, and maintainable across AI and human contributors.

## 1. Skill (Stateless Execution)
**Definition**: A Skill is a stateless helper that performs a single, deterministic operation.
- **Stateless**: Skills must not maintain internal state or depend on global variables. All inputs must be passed as arguments.
- **Deterministic**: Given the same input, a Skill must always produce the same output (or trigger the same side effect).
- **Scope**: Database DML (CRUD), data formatting, mathematical calculations, and external API wrappers.
- **Example**: `saveMessage(msgData)`, `calculateBMR(weight, height, age)`.

## 2. Rule (Pure Policy)
**Definition**: A Rule is a configuration or document that defines business logic, constraints, or behavioral policy.
- **Non-Execution**: Rules define "What" and "Why", not "How". They are often stored as JSON, Markdown, or specialized configuration files.
- **Scope**: AI prompt instructions, validation thresholds (e.g., alert triggers), RBAC permissions, and UI design tokens.
- **Example**: `VOICE_TONE = "Clinical"`, `MAX_DAILY_TOKEN_BUDGET = 5000`.

## 3. Workflow (Orchestration)
**Definition**: A Workflow is a stateful or sequential process that coordinates Skills and Rules to achieve a high-level goal.
- **Orchestration**: Workflows bridge the gap between user intent and execution. They handle control flow (if/then), error recovery, and transaction boundaries.
- **Scope**: API Request Handlers, Onboarding Sequences, Data Consolidation Pipelines.
- **Example**: `ChatWorkflow` fetches `Rules` (Instructions), calls `Skills` (History/Vitals), and saves the result (Skill).

## 4. Enforcement Constraints

1. **Workflow Purity**: 
   - Workflows MUST NOT contain raw data access logic (e.g., direct SQL, ORMs, or `.from()` calls).
   - They must delegate all I/O to Skill modules.
   - Workflows focus on the **Sequence of Operations**, not the execution details.

2. **Skill Isolation**:
   - Skills should be stateless execution helpers. If state is required, it must be passed by the Workflow.
   - Skills are the ONLY layer permitted to perform I/O (Database, API, File System).

3. **Rule Immutability**:
   - Rules are static policies and should not be modified by Skills or Workflows during runtime.
   - Evaluation of Rules should be handled by Skills or Workflows as pure functions.

## 5. Violation Checks (Governance)

During architectural audits, the following are flagged as **critical regressions**:
- [ ] Inline database queries (e.g., `.from()`, `SELECT`, `UPDATE`) found within a Workflow/Handler folder.
- [ ] Complex orchestration (if/else/retry) leaking into a Skill module.
- [ ] Hardcoded business policy (Rules) inside an executable Skill.

---
*Failure to adhere to SRW boundaries is considered an architectural regression and must be flagged during audits.*
