# Global Agent Context Efficiency

## Purpose

AI agents consume tokens for every file read, tool output, and instruction loaded. Governed repos should treat agent context as a finite, shared budget and prefer targeted, filtered interactions over broad, unfiltered ones.

## Core Requirements

1. Prefer targeted reads over whole-file reads. Grep for the relevant function or section instead of reading an entire file into context.
2. Filter noisy output at the source. When running tests, surface failures and summary lines only. When reading logs, surface error and warning lines only. When searching, cap results to actionable counts.
3. Keep project instruction files lean. Move detailed procedures, checklists, and reference material into on-demand skills that load only when invoked. Project instructions should stay under 200 lines.
4. Compact or summarize proactively before context fills. After compacting, use a codebase overview skill to re-orient rather than re-reading source files.
5. Route read-only exploration to the cheapest available model or tool when the task does not require reasoning or editing.

## Practical Guidance

- Test output filtering: pipe test runners through a failure-only filter (grep for FAIL, Error, assertion lines) and cap at 150 lines. Full output should remain available on request.
- Log file filtering: pipe log reads through an error-level filter (ERROR, WARN, FATAL, Exception, Traceback) and cap at 200 lines.
- Search result capping: when using grep or find, limit results to 50 matches. If more exist, narrow the query.
- File reading: prefer reading specific line ranges over entire files. Use `grep -n` to locate relevant sections first.
- Instruction layering: base instructions load every session; skills load only on demand. Any procedure over 5 lines belongs in a skill.

## Validation Expectations

1. Project instruction files (CLAUDE.md, .cursorrules, etc.) should remain under 200 lines. Overages signal content that should migrate to skills.
2. If a tool call returns more than 500 lines of output, consider whether a filter or cap should have been applied.
3. Agent-facing output filters should be transparent — the user can always request unfiltered output explicitly.
