# Changelog

All notable changes to the governance model are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Global commands: test, lint, deploy, security-audit, release
- Dry-run mode for bootstrap and link scripts (`--dry-run`)
- Signal handlers for safe script interruption (INT/TERM traps)
- Ripgrep dependency check in verification script
- Expanded skill authoring guidelines with structure, testing, naming, and anti-patterns
- Skills loading added to MASTER mandatory inputs and load order
- Symlink target validation in verification script
- Global command file existence checks in verification script

### Fixed
- Typo in link_ai_governance.sh: `commnads` cleanup now also removes `commands` legacy symlinks
- Null-guard added to `cleanup_legacy_governance()` preventing glob expansion on empty path
- Temp file cleanup via EXIT trap in ensure_governance_links.sh
- Load order consistency: `.agent/commands/global/*.md` removed from MASTER step 5 (already covered by step 3)
- Reference format standardized (no leading `/`) in global-AGENTS.md and global-opencode.md

### Changed
- Skill authoring guidelines expanded from 4 bullets to comprehensive guide with definition, structure, rules, testing, naming, and anti-patterns
- MASTER load order now has 6 steps (added step 4 for skills)
