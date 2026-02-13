# AI Governance Onboarding

This repo is the single source of truth for all AI governance assets. Client repos consume these files via symlinks.

## What lives here
- `.agent/` (skills, rules, workflows, prompts)
- `.cursorrules`
- `.cursor/rules/ai-governance.mdc`
- `.vscode/settings.json`
- `AGENTS.md`, `CLAUDE.md`, `opencode.json`
- `scripts/` (linking + bootstrap helpers)

## Add a new skill/rule/workflow
1. Create files under `.agent/skills`, `.agent/rules`, or `.agent/workflows`.
2. Commit here (this repo).
3. Client repos will pick it up automatically via hooks or by running:
   ```bash
   bash scripts/ensure_governance_links.sh
   ```

## Link a client repo (recommended)
From this repo:
```bash
scripts/bootstrap_link.sh /path/to/client/repo
```

This will:
- set `ai.governanceRoot` in the client repo config
- set `core.hooksPath` to `.githooks` if present
- link all governance files into the client repo

## Manual link
```bash
scripts/link_ai_governance.sh --source ~/dev/ai_governance --env /path/to/client/repo --force
```

## Hooks
Client repos should have:
- `.githooks/post-checkout`
- `.githooks/post-merge`
- `.githooks/post-rewrite`

These run `scripts/ensure_governance_links.sh` to keep links current.

## Troubleshooting
- If links look stale, run `bash scripts/ensure_governance_links.sh` in the client repo.
- If hooks do not run, ensure `git config core.hooksPath .githooks` is set in the client repo.
