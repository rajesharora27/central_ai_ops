import { ArtifactType, AIEnvironment, Prisma } from '@prisma/client';
import { envConfig } from '../../config/env';
import { GraphQLContext } from '../../shared/graphql/context';
import { requireUser } from '../../shared/auth/auth-helpers';
import { readArtifactContent, writeArtifactContent } from '../../shared/governance/artifact-scanner';
import { syncArtifactsFromDisk } from '../../shared/governance/sync-engine';
import { computeContentHash } from '../../shared/utils/hash';
import { buildConnection, decodeCursor } from '../../shared/utils/pagination';

const TYPE_TO_PATH_PREFIX: Record<ArtifactType, string> = {
  RULE: 'global/rules',
  SKILL: 'global/skills',
  WORKFLOW: 'global/workflows',
  COMMAND: 'global/commands',
  ENVIRONMENT_WRAPPER: 'global',
};

function buildFilePath(type: ArtifactType, name: string): string {
  const prefix = TYPE_TO_PATH_PREFIX[type];
  if (type === 'SKILL') {
    return `${prefix}/${name}/SKILL.md`;
  }
  return `${prefix}/${name}.md`;
}

export const artifactResolvers = {
  GovernanceArtifact: {
    content: (parent: { filePath: string }) => {
      try {
        return readArtifactContent(envConfig.governanceRoot, parent.filePath);
      } catch {
        return '';
      }
    },
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
  },

  Query: {
    artifact: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      return ctx.prisma.governanceArtifact.findUnique({
        where: { id: args.id },
        include: { assignments: { include: { project: true } } },
      });
    },

    artifacts: async (
      _: unknown,
      args: {
        first?: number;
        after?: string;
        filter?: {
          type?: ArtifactType;
          environment?: AIEnvironment;
          isActive?: boolean;
          search?: string;
        };
      },
      ctx: GraphQLContext
    ) => {
      const where: Prisma.GovernanceArtifactWhereInput = {};

      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.isActive !== undefined) where.isActive = args.filter.isActive;
      if (args.filter?.environment) {
        where.environments = { has: args.filter.environment };
      }
      if (args.filter?.search) {
        where.OR = [
          { name: { contains: args.filter.search, mode: 'insensitive' } },
          { displayName: { contains: args.filter.search, mode: 'insensitive' } },
          { description: { contains: args.filter.search, mode: 'insensitive' } },
        ];
      }

      const limit = (args.first ?? 50) + 1;
      const cursor = args.after ? { id: decodeCursor(args.after) } : undefined;

      const [items, totalCount] = await Promise.all([
        ctx.prisma.governanceArtifact.findMany({
          where,
          take: limit,
          skip: cursor ? 1 : 0,
          cursor,
          orderBy: { name: 'asc' },
          include: { assignments: true },
        }),
        ctx.prisma.governanceArtifact.count({ where }),
      ]);

      return buildConnection(items, totalCount, { first: args.first, after: args.after });
    },

    artifactByPath: async (_: unknown, args: { filePath: string }, ctx: GraphQLContext) => {
      return ctx.prisma.governanceArtifact.findUnique({
        where: { filePath: args.filePath },
      });
    },
  },

  Mutation: {
    createArtifact: async (
      _: unknown,
      args: {
        input: {
          name: string;
          displayName: string;
          type: ArtifactType;
          description?: string;
          environments: AIEnvironment[];
          content: string;
          metadata?: unknown;
        };
      },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const { input } = args;
      const filePath = buildFilePath(input.type, input.name);

      writeArtifactContent(envConfig.governanceRoot, filePath, input.content);
      const contentHash = computeContentHash(input.content);

      const artifact = await ctx.prisma.governanceArtifact.create({
        data: {
          name: input.name,
          displayName: input.displayName,
          type: input.type,
          description: input.description || null,
          filePath,
          contentHash,
          environments: input.environments,
          metadata: input.metadata as Prisma.InputJsonValue ?? Prisma.JsonNull,
        },
      });

      await ctx.prisma.governanceAuditLog.create({
        data: {
          action: 'CREATE',
          userId: ctx.userId,
          artifactId: artifact.id,
          details: { name: input.name, type: input.type },
        },
      });

      return artifact;
    },

    updateArtifact: async (
      _: unknown,
      args: {
        id: string;
        input: {
          displayName?: string;
          description?: string;
          environments?: AIEnvironment[];
          content?: string;
          metadata?: unknown;
          isActive?: boolean;
        };
      },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const { id, input } = args;

      const existing = await ctx.prisma.governanceArtifact.findUnique({ where: { id } });
      if (!existing) throw new Error('Artifact not found');

      const updateData: Prisma.GovernanceArtifactUpdateInput = {};
      if (input.displayName !== undefined) updateData.displayName = input.displayName;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.environments !== undefined) updateData.environments = input.environments;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.metadata !== undefined) updateData.metadata = input.metadata as Prisma.InputJsonValue;

      if (input.content !== undefined) {
        writeArtifactContent(envConfig.governanceRoot, existing.filePath, input.content);
        updateData.contentHash = computeContentHash(input.content);
        updateData.version = { increment: 1 };
      }

      const artifact = await ctx.prisma.governanceArtifact.update({
        where: { id },
        data: updateData,
      });

      await ctx.prisma.governanceAuditLog.create({
        data: {
          action: 'UPDATE',
          userId: ctx.userId,
          artifactId: artifact.id,
          details: { fields: Object.keys(input) },
        },
      });

      return artifact;
    },

    deleteArtifact: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireUser(ctx);

      const artifact = await ctx.prisma.governanceArtifact.findUnique({ where: { id: args.id } });
      if (!artifact) throw new Error('Artifact not found');

      await ctx.prisma.governanceAuditLog.create({
        data: {
          action: 'DELETE',
          userId: ctx.userId,
          details: { name: artifact.name, filePath: artifact.filePath },
        },
      });

      await ctx.prisma.governanceArtifact.delete({ where: { id: args.id } });
      return true;
    },

    syncArtifactsFromDisk: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireUser(ctx);
      const result = await syncArtifactsFromDisk(ctx.prisma, envConfig.governanceRoot);

      await ctx.prisma.governanceAuditLog.create({
        data: {
          action: 'SYNC',
          userId: ctx.userId,
          details: result,
        },
      });

      return result;
    },
  },
};
