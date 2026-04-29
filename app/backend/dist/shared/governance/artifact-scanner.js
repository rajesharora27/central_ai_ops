"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanGovernanceDirectory = scanGovernanceDirectory;
exports.readArtifactContent = readArtifactContent;
exports.writeArtifactContent = writeArtifactContent;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const hash_1 = require("../utils/hash");
function toDisplayName(filename) {
    return filename
        .replace(/^global-/, '')
        .replace(/\.md$/, '')
        .replace(/\.mdc$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
function extractDescription(content) {
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
            return trimmed.length > 200 ? trimmed.slice(0, 200) + '...' : trimmed;
        }
    }
    return null;
}
function scanGovernanceDirectory(governanceRoot) {
    const artifacts = [];
    const rulesDir = path_1.default.join(governanceRoot, 'rules');
    if (fs_1.default.existsSync(rulesDir)) {
        for (const file of fs_1.default.readdirSync(rulesDir)) {
            if (!file.endsWith('.md'))
                continue;
            const filePath = path_1.default.join('global', 'rules', file);
            const absPath = path_1.default.join(governanceRoot, 'rules', file);
            const content = fs_1.default.readFileSync(absPath, 'utf-8');
            artifacts.push({
                name: file.replace(/\.md$/, ''),
                displayName: toDisplayName(file),
                type: 'RULE',
                filePath,
                contentHash: (0, hash_1.computeContentHash)(content),
                description: extractDescription(content),
            });
        }
    }
    const skillsDir = path_1.default.join(governanceRoot, 'skills');
    if (fs_1.default.existsSync(skillsDir)) {
        const guidelinesFile = path_1.default.join(skillsDir, 'global-skill-authoring-guidelines.md');
        if (fs_1.default.existsSync(guidelinesFile)) {
            const content = fs_1.default.readFileSync(guidelinesFile, 'utf-8');
            artifacts.push({
                name: 'global-skill-authoring-guidelines',
                displayName: 'Skill Authoring Guidelines',
                type: 'SKILL',
                filePath: 'global/skills/global-skill-authoring-guidelines.md',
                contentHash: (0, hash_1.computeContentHash)(content),
                description: extractDescription(content),
            });
        }
        for (const entry of fs_1.default.readdirSync(skillsDir, { withFileTypes: true })) {
            if (!entry.isDirectory())
                continue;
            const skillFile = path_1.default.join(skillsDir, entry.name, 'SKILL.md');
            if (!fs_1.default.existsSync(skillFile))
                continue;
            const content = fs_1.default.readFileSync(skillFile, 'utf-8');
            artifacts.push({
                name: entry.name,
                displayName: toDisplayName(entry.name),
                type: 'SKILL',
                filePath: path_1.default.join('global', 'skills', entry.name, 'SKILL.md'),
                contentHash: (0, hash_1.computeContentHash)(content),
                description: extractDescription(content),
            });
        }
    }
    const workflowsDir = path_1.default.join(governanceRoot, 'workflows');
    if (fs_1.default.existsSync(workflowsDir)) {
        for (const file of fs_1.default.readdirSync(workflowsDir)) {
            if (!file.endsWith('.md'))
                continue;
            const filePath = path_1.default.join('global', 'workflows', file);
            const absPath = path_1.default.join(governanceRoot, 'workflows', file);
            const content = fs_1.default.readFileSync(absPath, 'utf-8');
            artifacts.push({
                name: file.replace(/\.md$/, ''),
                displayName: toDisplayName(file),
                type: 'WORKFLOW',
                filePath,
                contentHash: (0, hash_1.computeContentHash)(content),
                description: extractDescription(content),
            });
        }
    }
    const commandsDir = path_1.default.join(governanceRoot, 'commands');
    if (fs_1.default.existsSync(commandsDir)) {
        for (const file of fs_1.default.readdirSync(commandsDir)) {
            if (!file.endsWith('.md'))
                continue;
            const filePath = path_1.default.join('global', 'commands', file);
            const absPath = path_1.default.join(governanceRoot, 'commands', file);
            const content = fs_1.default.readFileSync(absPath, 'utf-8');
            artifacts.push({
                name: file.replace(/\.md$/, ''),
                displayName: toDisplayName(file),
                type: 'COMMAND',
                filePath,
                contentHash: (0, hash_1.computeContentHash)(content),
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
        const absPath = path_1.default.join(governanceRoot, file);
        if (!fs_1.default.existsSync(absPath))
            continue;
        const content = fs_1.default.readFileSync(absPath, 'utf-8');
        artifacts.push({
            name: file.replace(/\.md$/, ''),
            displayName: toDisplayName(file),
            type: 'ENVIRONMENT_WRAPPER',
            filePath: path_1.default.join('global', file),
            contentHash: (0, hash_1.computeContentHash)(content),
            description: extractDescription(content),
        });
    }
    const cursorDir = path_1.default.join(governanceRoot, 'cursor');
    if (fs_1.default.existsSync(cursorDir)) {
        for (const file of fs_1.default.readdirSync(cursorDir)) {
            if (!file.endsWith('.md') && !file.endsWith('.mdc'))
                continue;
            const absPath = path_1.default.join(cursorDir, file);
            const content = fs_1.default.readFileSync(absPath, 'utf-8');
            artifacts.push({
                name: file.replace(/\.md[c]?$/, ''),
                displayName: toDisplayName(file),
                type: 'ENVIRONMENT_WRAPPER',
                filePath: path_1.default.join('global', 'cursor', file),
                contentHash: (0, hash_1.computeContentHash)(content),
                description: extractDescription(content),
            });
        }
    }
    return artifacts;
}
function readArtifactContent(governanceRoot, filePath) {
    const relativePath = filePath.startsWith('global/')
        ? filePath.slice('global/'.length)
        : filePath;
    const absPath = path_1.default.join(governanceRoot, relativePath);
    if (!fs_1.default.existsSync(absPath)) {
        throw new Error(`Artifact file not found: ${absPath}`);
    }
    return fs_1.default.readFileSync(absPath, 'utf-8');
}
function writeArtifactContent(governanceRoot, filePath, content) {
    const relativePath = filePath.startsWith('global/')
        ? filePath.slice('global/'.length)
        : filePath;
    const absPath = path_1.default.join(governanceRoot, relativePath);
    const dir = path_1.default.dirname(absPath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    fs_1.default.writeFileSync(absPath, content, 'utf-8');
}
//# sourceMappingURL=artifact-scanner.js.map