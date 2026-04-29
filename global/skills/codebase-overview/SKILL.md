# Skill: Codebase Overview

## Purpose

Provide instant project orientation so agents do not spend tokens exploring files to understand structure. Each project fills in its own instance of this template.

## When to Run

- At session start or after context compaction to reload project awareness
- When an agent asks "what does this project do?" or "where do I find X?"
- When starting work on an unfamiliar part of the codebase

## Template

Projects should create a filled instance at `.agent/skills/project/codebase-overview/SKILL.md` covering:

1. **Project purpose** — one sentence
2. **Tech stack** — language, framework, database, test runner, package manager
3. **Key directories** — only dirs the agent will frequently navigate, with one-line descriptions
4. **Naming conventions** — file naming, test naming, env var prefixes, anything non-obvious
5. **Common entry points** — which files to read first for different task types (new endpoint, business logic, schema change, config)
6. **Non-obvious gotchas** — patterns, constraints, or decisions that would waste tokens to discover by reading

## Constraints

- Keep the filled overview under 150 lines total
- Update the overview when structural changes occur (new directories, renamed modules, changed conventions)
- Do not duplicate information already in CONTRIBUTING.md — reference it instead

## Outputs

A concise architecture map that gives the agent enough context to navigate the codebase without exploratory reads.

## Example

See the project-specific instance in `.agent/skills/project/codebase-overview/SKILL.md` for the filled version.
