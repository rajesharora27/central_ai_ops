import fs from 'fs';
import path from 'path';
import { computeContentHash } from '../utils/hash';

export type ScannedArtifact = {
  name: string;
  displayName: string;
  type: 'RULE' | 'SKILL' | 'WORKFLOW' | 'COMMAND' | 'ENVIRONMENT_WRAPPER';
  filePath: string;
  contentHash: string;
  description: string | null;
};

function toDisplayName(filename: string): string {
  return filename
    .replace(/^global-/, '')
    .replace(/\.md$/, '')
    .replace(/\.mdc$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractDescription(content: string): string | null {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      return trimmed.length > 200 ? trimmed.slice(0, 200) + '...' : trimmed;
    }
  }
  return null;
}

export function scanGovernanceDirectory(governanceRoot: string): ScannedArtifact[] {
  const artifacts: ScannedArtifact[] = [];

  const rulesDir = path.join(governanceRoot, 'rules');
  if (fs.existsSync(rulesDir)) {
    for (const file of fs.readdirSync(rulesDir)) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join('global', 'rules', file);
      const absPath = path.join(governanceRoot, 'rules', file);
      const content = fs.readFileSync(absPath, 'utf-8');
      artifacts.push({
        name: file.replace(/\.md$/, ''),
        displayName: toDisplayName(file),
        type: 'RULE',
        filePath,
        contentHash: computeContentHash(content),
        description: extractDescription(content),
      });
    }
  }

  const skillsDir = path.join(governanceRoot, 'skills');
  if (fs.existsSync(skillsDir)) {
    const guidelinesFile = path.join(skillsDir, 'global-skill-authoring-guidelines.md');
    if (fs.existsSync(guidelinesFile)) {
      const content = fs.readFileSync(guidelinesFile, 'utf-8');
      artifacts.push({
        name: 'global-skill-authoring-guidelines',
        displayName: 'Skill Authoring Guidelines',
        type: 'SKILL',
        filePath: 'global/skills/global-skill-authoring-guidelines.md',
        contentHash: computeContentHash(content),
        description: extractDescription(content),
      });
    }

    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      const content = fs.readFileSync(skillFile, 'utf-8');
      artifacts.push({
        name: entry.name,
        displayName: toDisplayName(entry.name),
        type: 'SKILL',
        filePath: path.join('global', 'skills', entry.name, 'SKILL.md'),
        contentHash: computeContentHash(content),
        description: extractDescription(content),
      });
    }
  }

  const workflowsDir = path.join(governanceRoot, 'workflows');
  if (fs.existsSync(workflowsDir)) {
    for (const file of fs.readdirSync(workflowsDir)) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join('global', 'workflows', file);
      const absPath = path.join(governanceRoot, 'workflows', file);
      const content = fs.readFileSync(absPath, 'utf-8');
      artifacts.push({
        name: file.replace(/\.md$/, ''),
        displayName: toDisplayName(file),
        type: 'WORKFLOW',
        filePath,
        contentHash: computeContentHash(content),
        description: extractDescription(content),
      });
    }
  }

  const commandsDir = path.join(governanceRoot, 'commands');
  if (fs.existsSync(commandsDir)) {
    for (const file of fs.readdirSync(commandsDir)) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join('global', 'commands', file);
      const absPath = path.join(governanceRoot, 'commands', file);
      const content = fs.readFileSync(absPath, 'utf-8');
      artifacts.push({
        name: file.replace(/\.md$/, ''),
        displayName: toDisplayName(file),
        type: 'COMMAND',
        filePath,
        contentHash: computeContentHash(content),
        description: extractDescription(content),
      });
    }
  }

  const envWrappers = [
    'global-MASTER.md',
    'global-CLAUDE.md',
    'global-AGENTS.md',
    'global-codex.md',
    'global-opencode.md',
  ];
  for (const file of envWrappers) {
    const absPath = path.join(governanceRoot, file);
    if (!fs.existsSync(absPath)) continue;
    const content = fs.readFileSync(absPath, 'utf-8');
    artifacts.push({
      name: file.replace(/\.md$/, ''),
      displayName: toDisplayName(file),
      type: 'ENVIRONMENT_WRAPPER',
      filePath: path.join('global', file),
      contentHash: computeContentHash(content),
      description: extractDescription(content),
    });
  }

  const cursorDir = path.join(governanceRoot, 'cursor');
  if (fs.existsSync(cursorDir)) {
    for (const file of fs.readdirSync(cursorDir)) {
      if (!file.endsWith('.md') && !file.endsWith('.mdc')) continue;
      const absPath = path.join(cursorDir, file);
      const content = fs.readFileSync(absPath, 'utf-8');
      artifacts.push({
        name: file.replace(/\.md[c]?$/, ''),
        displayName: toDisplayName(file),
        type: 'ENVIRONMENT_WRAPPER',
        filePath: path.join('global', 'cursor', file),
        contentHash: computeContentHash(content),
        description: extractDescription(content),
      });
    }
  }

  return artifacts;
}

export function readArtifactContent(governanceRoot: string, filePath: string): string {
  const relativePath = filePath.startsWith('global/')
    ? filePath.slice('global/'.length)
    : filePath;
  const absPath = path.join(governanceRoot, relativePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Artifact file not found: ${absPath}`);
  }
  return fs.readFileSync(absPath, 'utf-8');
}

export function writeArtifactContent(
  governanceRoot: string,
  filePath: string,
  content: string
): void {
  const relativePath = filePath.startsWith('global/')
    ? filePath.slice('global/'.length)
    : filePath;
  const absPath = path.join(governanceRoot, relativePath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(absPath, content, 'utf-8');
}
