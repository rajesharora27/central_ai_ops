import Anthropic from '@anthropic-ai/sdk';
import { ArtifactType } from '@prisma/client';
import { envConfig } from '../../config/env';
import { GraphQLContext } from '../../shared/graphql/context';
import { requireUser } from '../../shared/auth/auth-helpers';
import { readArtifactContent } from '../../shared/governance/artifact-scanner';

const TYPE_LABELS: Record<string, string> = {
  RULE: 'policy rule',
  SKILL: 'stateless execution skill',
  WORKFLOW: 'orchestration workflow',
  COMMAND: 'command playbook',
};

function buildSystemPrompt(type: string, references: string[]): string {
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

function inferType(prompt: string, hintType?: ArtifactType): ArtifactType {
  if (hintType) return hintType;
  const lower = prompt.toLowerCase();
  if (lower.includes('rule') || lower.includes('policy') || lower.includes('require') || lower.includes('must')) return 'RULE';
  if (lower.includes('skill') || lower.includes('check') || lower.includes('scan') || lower.includes('validate')) return 'SKILL';
  if (lower.includes('workflow') || lower.includes('checklist') || lower.includes('process') || lower.includes('steps')) return 'WORKFLOW';
  if (lower.includes('command') || lower.includes('playbook')) return 'COMMAND';
  return 'RULE';
}

function inferName(content: string, type: ArtifactType): { name: string; displayName: string } {
  const headingMatch = content.match(/^#\s+(.+)/m);
  const heading = headingMatch?.[1] || 'Untitled Artifact';
  const displayName = heading.replace(/^(Global\s+)?/i, '').trim();
  const name = 'global-' + displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  return { name, displayName };
}

async function generate(
  prompt: string,
  type: ArtifactType,
  references: string[],
  existingContent?: string
): Promise<{ content: string; name: string; displayName: string; type: ArtifactType }> {
  if (!envConfig.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({ apiKey: envConfig.anthropicApiKey });
  const systemPrompt = buildSystemPrompt(type, references);

  const userMessage = existingContent
    ? `Refine this existing artifact based on the following instructions:\n\nInstructions: ${prompt}\n\nExisting content:\n${existingContent}`
    : prompt;

  const response = await client.messages.create({
    model: envConfig.anthropicModel,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const { name, displayName } = inferName(content, type);
  return { content, name, displayName, type };
}

export const aiAuthoringResolvers = {
  Mutation: {
    generateArtifactContent: async (
      _: unknown,
      args: {
        input: {
          prompt: string;
          type?: ArtifactType;
          environments?: string[];
          existingContent?: string;
          referenceArtifactIds?: string[];
        };
      },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const { input } = args;
      const type = inferType(input.prompt, input.type as ArtifactType | undefined);

      const references: string[] = [];
      if (input.referenceArtifactIds?.length) {
        for (const id of input.referenceArtifactIds.slice(0, 3)) {
          const artifact = await ctx.prisma.governanceArtifact.findUnique({ where: { id } });
          if (artifact) {
            try {
              references.push(readArtifactContent(envConfig.governanceRoot, artifact.filePath));
            } catch { /* skip missing files */ }
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
            references.push(readArtifactContent(envConfig.governanceRoot, artifact.filePath));
          } catch { /* skip */ }
        }
      }

      const result = await generate(input.prompt, type, references, input.existingContent);
      return { ...result, confidence: 0.85, suggestions: [] };
    },

    refineArtifactContent: async (
      _: unknown,
      args: {
        input: {
          prompt: string;
          type?: ArtifactType;
          existingContent?: string;
          referenceArtifactIds?: string[];
        };
      },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const { input } = args;
      if (!input.existingContent) throw new Error('existingContent is required for refinement');
      const type = inferType(input.prompt, input.type as ArtifactType | undefined);
      const result = await generate(input.prompt, type, [], input.existingContent);
      return { ...result, confidence: 0.9, suggestions: [] };
    },
  },
};
