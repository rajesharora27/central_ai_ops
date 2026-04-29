"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiAuthoringResolvers = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const env_1 = require("../../config/env");
const auth_helpers_1 = require("../../shared/auth/auth-helpers");
const artifact_scanner_1 = require("../../shared/governance/artifact-scanner");
const TYPE_LABELS = {
    RULE: 'policy rule',
    SKILL: 'stateless execution skill',
    WORKFLOW: 'orchestration workflow',
    COMMAND: 'command playbook',
};
function buildSystemPrompt(type, references) {
    const typeLabel = TYPE_LABELS[type] || 'governance artifact';
    let prompt = `You are a governance artifact author for an AI operations framework.
You write precise, actionable governance documents in Markdown format.

The framework uses the SRW (Skills, Rules, Workflows) architecture:
- Skills: stateless execution helpers — no I/O, deterministic, idempotent
- Rules: pure policy documents — constraints, validation, enforcement points
- Workflows: orchestration templates — step-by-step process guidance

Generate a ${typeLabel} artifact based on the user's description.
Output ONLY the markdown content with proper heading structure.
Use clear, imperative language. Each section should be actionable.`;
    if (references.length > 0) {
        prompt += '\n\nHere are reference examples of existing artifacts for style matching:\n\n';
        for (const ref of references) {
            prompt += `---\n${ref.slice(0, 2000)}\n---\n\n`;
        }
    }
    return prompt;
}
function inferType(prompt, hintType) {
    if (hintType)
        return hintType;
    const lower = prompt.toLowerCase();
    if (lower.includes('rule') || lower.includes('policy') || lower.includes('require') || lower.includes('must'))
        return 'RULE';
    if (lower.includes('skill') || lower.includes('check') || lower.includes('scan') || lower.includes('validate'))
        return 'SKILL';
    if (lower.includes('workflow') || lower.includes('checklist') || lower.includes('process') || lower.includes('steps'))
        return 'WORKFLOW';
    if (lower.includes('command') || lower.includes('playbook'))
        return 'COMMAND';
    return 'RULE';
}
function inferName(content, type) {
    const headingMatch = content.match(/^#\s+(.+)/m);
    const heading = headingMatch?.[1] || 'Untitled Artifact';
    const displayName = heading.replace(/^(Global\s+)?/i, '').trim();
    const name = 'global-' + displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    return { name, displayName };
}
async function generate(prompt, type, references, existingContent) {
    if (!env_1.envConfig.anthropicApiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }
    const client = new sdk_1.default({ apiKey: env_1.envConfig.anthropicApiKey });
    const systemPrompt = buildSystemPrompt(type, references);
    const userMessage = existingContent
        ? `Refine this existing artifact based on the following instructions:\n\nInstructions: ${prompt}\n\nExisting content:\n${existingContent}`
        : prompt;
    const response = await client.messages.create({
        model: env_1.envConfig.anthropicModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
    });
    const content = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n');
    const { name, displayName } = inferName(content, type);
    return { content, name, displayName, type };
}
exports.aiAuthoringResolvers = {
    Mutation: {
        generateArtifactContent: async (_, args, ctx) => {
            (0, auth_helpers_1.requireUser)(ctx);
            const { input } = args;
            const type = inferType(input.prompt, input.type);
            const references = [];
            if (input.referenceArtifactIds?.length) {
                for (const id of input.referenceArtifactIds.slice(0, 3)) {
                    const artifact = await ctx.prisma.governanceArtifact.findUnique({ where: { id } });
                    if (artifact) {
                        try {
                            references.push((0, artifact_scanner_1.readArtifactContent)(env_1.envConfig.governanceRoot, artifact.filePath));
                        }
                        catch { /* skip missing files */ }
                    }
                }
            }
            if (references.length === 0) {
                const sameType = await ctx.prisma.governanceArtifact.findMany({
                    where: { type, isActive: true },
                    take: 2,
                });
                for (const artifact of sameType) {
                    try {
                        references.push((0, artifact_scanner_1.readArtifactContent)(env_1.envConfig.governanceRoot, artifact.filePath));
                    }
                    catch { /* skip */ }
                }
            }
            const result = await generate(input.prompt, type, references, input.existingContent);
            return { ...result, confidence: 0.85, suggestions: [] };
        },
        refineArtifactContent: async (_, args, ctx) => {
            (0, auth_helpers_1.requireUser)(ctx);
            const { input } = args;
            if (!input.existingContent)
                throw new Error('existingContent is required for refinement');
            const type = inferType(input.prompt, input.type);
            const result = await generate(input.prompt, type, [], input.existingContent);
            return { ...result, confidence: 0.9, suggestions: [] };
        },
    },
};
//# sourceMappingURL=ai-authoring.resolver.js.map