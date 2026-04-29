# Global Command Transparency

## Purpose

Every command the agent executes must be visible to the user. Silent or hidden execution erodes trust and makes debugging impossible.

## Core Requirements

1. Before executing any shell command, state the command and its purpose in user-visible output.
2. After execution, report the outcome: success, failure, or notable output.
3. Never suppress, swallow, or redirect command output in a way that hides errors from the user.
4. When chaining multiple commands, list each one so the user can follow the sequence.

## What to Show

- The exact command being run (not a paraphrase).
- Why the command is being run (one sentence of context).
- The result: exit status, key output lines, or error messages.

## Guardrails

- Do not batch destructive commands silently behind a single summary.
- If a command produces excessive output, summarize it but note the full output is available.
- If a command fails, report the failure immediately rather than retrying silently.
- When running background processes, state that the command is backgrounded and how to check its status.
