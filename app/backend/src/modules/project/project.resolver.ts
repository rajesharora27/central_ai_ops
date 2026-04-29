import crypto from 'crypto';
import { execSync } from 'child_process';
import { AIEnvironment, Prisma } from '@prisma/client';
import { envConfig } from '../../config/env';
import { GraphQLContext } from '../../shared/graphql/context';
import { requireUser } from '../../shared/auth/auth-helpers';
import { checkProjectCompliance } from '../../shared/governance/compliance-checker';
import { buildConnection, decodeCursor } from '../../shared/utils/pagination';

export const projectResolvers = {
  Project: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
    lastVerifiedAt: (parent: { lastVerifiedAt: Date | null }) =>
      parent.lastVerifiedAt?.toISOString() ?? null,
    assignments: (parent: { id: string }, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.projectArtifactAssignment.findMany({
        where: { projectId: parent.id },
        include: { artifact: true, project: true },
      }),
    recentChecks: (
      parent: { id: string },
      args: { first?: number },
      ctx: GraphQLContext
    ) =>
      ctx.prisma.complianceCheck.findMany({
        where: { projectId: parent.id },
        take: args.first ?? 10,
        orderBy: { createdAt: 'desc' },
        include: { project: true },
      }),
  },

  ProjectArtifactAssignment: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
  },

  ComplianceCheck: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },

  Query: {
    project: (_: unknown, args: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.project.findUnique({
        where: { id: args.id },
        include: { assignments: { include: { artifact: true, project: true } } },
      }),

    projectBySlug: (_: unknown, args: { slug: string }, ctx: GraphQLContext) =>
      ctx.prisma.project.findUnique({
        where: { slug: args.slug },
        include: { assignments: { include: { artifact: true, project: true } } },
      }),

    projects: async (
      _: unknown,
      args: { first?: number; after?: string },
      ctx: GraphQLContext
    ) => {
      const limit = (args.first ?? 50) + 1;
      const cursor = args.after ? { id: decodeCursor(args.after) } : undefined;

      const [items, totalCount] = await Promise.all([
        ctx.prisma.project.findMany({
          take: limit,
          skip: cursor ? 1 : 0,
          cursor,
          orderBy: { name: 'asc' },
          include: { assignments: { include: { artifact: true } } },
        }),
        ctx.prisma.project.count(),
      ]);

      return buildConnection(items, totalCount, args);
    },

    complianceDashboard: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const [projects, totalArtifacts, activeArtifacts, recentChecks] =
        await Promise.all([
          ctx.prisma.project.findMany({
            where: { isActive: true },
            include: { assignments: { include: { artifact: true } } },
          }),
          ctx.prisma.governanceArtifact.count(),
          ctx.prisma.governanceArtifact.count({ where: { isActive: true } }),
          ctx.prisma.complianceCheck.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { project: true },
          }),
        ]);

      return {
        totalProjects: projects.length,
        compliantCount: projects.filter((p) => p.complianceStatus === 'COMPLIANT').length,
        driftedCount: projects.filter((p) => p.complianceStatus === 'DRIFTED').length,
        nonCompliantCount: projects.filter((p) => p.complianceStatus === 'NON_COMPLIANT').length,
        unknownCount: projects.filter((p) => p.complianceStatus === 'UNKNOWN').length,
        totalArtifacts,
        activeArtifacts,
        recentChecks,
        projects,
      };
    },
  },

  Mutation: {
    createProject: async (
      _: unknown,
      args: { input: { name: string; slug: string; repoPath?: string; repoUrl?: string; description?: string; metadata?: unknown } },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const apiKey = `gov_${crypto.randomBytes(24).toString('hex')}`;

      const project = await ctx.prisma.project.create({
        data: {
          name: args.input.name,
          slug: args.input.slug,
          repoPath: args.input.repoPath || null,
          repoUrl: args.input.repoUrl || null,
          description: args.input.description || null,
          apiKey,
          metadata: (args.input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        },
      });

      await ctx.prisma.governanceAuditLog.create({
        data: { action: 'CREATE', userId: ctx.userId, projectId: project.id },
      });

      return project;
    },

    updateProject: async (
      _: unknown,
      args: { id: string; input: { name: string; slug: string; repoPath?: string; repoUrl?: string; description?: string; metadata?: unknown } },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      return ctx.prisma.project.update({
        where: { id: args.id },
        data: {
          name: args.input.name,
          slug: args.input.slug,
          repoPath: args.input.repoPath || null,
          repoUrl: args.input.repoUrl || null,
          description: args.input.description || null,
          metadata: (args.input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        },
      });
    },

    deleteProject: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireUser(ctx);
      await ctx.prisma.governanceAuditLog.create({
        data: { action: 'DELETE', userId: ctx.userId, projectId: args.id },
      });
      await ctx.prisma.project.delete({ where: { id: args.id } });
      return true;
    },

    assignArtifactToProject: async (
      _: unknown,
      args: {
        input: {
          projectId: string;
          artifactId: string;
          environments: AIEnvironment[];
          isRequired?: boolean;
          overridePolicy?: string;
        };
      },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      return ctx.prisma.projectArtifactAssignment.upsert({
        where: {
          projectId_artifactId: {
            projectId: args.input.projectId,
            artifactId: args.input.artifactId,
          },
        },
        create: {
          projectId: args.input.projectId,
          artifactId: args.input.artifactId,
          environments: args.input.environments,
          isRequired: args.input.isRequired ?? true,
          overridePolicy: args.input.overridePolicy || null,
        },
        update: {
          environments: args.input.environments,
          isRequired: args.input.isRequired ?? true,
          overridePolicy: args.input.overridePolicy || null,
        },
        include: { artifact: true, project: true },
      });
    },

    removeArtifactFromProject: async (
      _: unknown,
      args: { assignmentId: string },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      await ctx.prisma.projectArtifactAssignment.delete({
        where: { id: args.assignmentId },
      });
      return true;
    },

    bulkAssignArtifacts: async (
      _: unknown,
      args: { projectId: string; artifactIds: string[]; environments: AIEnvironment[] },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const results = [];
      for (const artifactId of args.artifactIds) {
        const assignment = await ctx.prisma.projectArtifactAssignment.upsert({
          where: {
            projectId_artifactId: {
              projectId: args.projectId,
              artifactId,
            },
          },
          create: {
            projectId: args.projectId,
            artifactId,
            environments: args.environments,
            isRequired: true,
          },
          update: {
            environments: args.environments,
          },
          include: { artifact: true, project: true },
        });
        results.push(assignment);
      }
      return results;
    },

    verifyProjectCompliance: async (
      _: unknown,
      args: { projectId: string },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const start = Date.now();
      const result = await checkProjectCompliance(
        ctx.prisma,
        args.projectId,
        envConfig.governanceRoot
      );
      const duration = Date.now() - start;

      await ctx.prisma.complianceCheck.create({
        data: {
          projectId: args.projectId,
          status: result.status,
          score: result.score,
          summary: result.summary,
          details: result.artifacts as unknown as Prisma.InputJsonValue,
          triggeredBy: 'manual',
          duration,
        },
      });

      await ctx.prisma.project.update({
        where: { id: args.projectId },
        data: {
          complianceStatus: result.status,
          complianceScore: result.score,
          lastVerifiedAt: new Date(),
        },
      });

      await ctx.prisma.governanceAuditLog.create({
        data: {
          action: 'VERIFY',
          userId: ctx.userId,
          projectId: args.projectId,
          details: { status: result.status, score: result.score },
        },
      });

      return {
        projectId: args.projectId,
        ...result,
        details: result.artifacts,
      };
    },

    applyGovernanceToProject: async (
      _: unknown,
      args: { projectId: string; environments?: AIEnvironment[] },
      ctx: GraphQLContext
    ) => {
      requireUser(ctx);
      const project = await ctx.prisma.project.findUnique({
        where: { id: args.projectId },
      });
      if (!project) throw new Error('Project not found');
      if (!project.repoPath) throw new Error('Project has no repository path');

      const bootstrapScript = require('path').resolve(
        envConfig.governanceRoot,
        '..',
        'scripts',
        'bootstrap_link.sh'
      );

      try {
        execSync(`bash "${bootstrapScript}" "${project.repoPath}"`, {
          cwd: require('path').resolve(envConfig.governanceRoot, '..'),
          timeout: 30000,
          encoding: 'utf-8',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, message: `Bootstrap failed: ${message}`, artifactsApplied: 0 };
      }

      const allArtifacts = await ctx.prisma.governanceArtifact.findMany({
        where: { isActive: true },
      });

      const envFilter = args.environments ?? ['ALL' as AIEnvironment];
      for (const artifact of allArtifacts) {
        await ctx.prisma.projectArtifactAssignment.upsert({
          where: {
            projectId_artifactId: {
              projectId: args.projectId,
              artifactId: artifact.id,
            },
          },
          create: {
            projectId: args.projectId,
            artifactId: artifact.id,
            environments: envFilter,
            isRequired: true,
          },
          update: {
            environments: envFilter,
          },
        });
      }

      await ctx.prisma.governanceAuditLog.create({
        data: {
          action: 'APPLY',
          userId: ctx.userId,
          projectId: args.projectId,
          details: { artifactsApplied: allArtifacts.length },
        },
      });

      return {
        success: true,
        message: `Governance applied to ${project.name}`,
        artifactsApplied: allArtifacts.length,
      };
    },

    regenerateApiKey: async (_: unknown, args: { projectId: string }, ctx: GraphQLContext) => {
      requireUser(ctx);
      const apiKey = `gov_${crypto.randomBytes(24).toString('hex')}`;
      return ctx.prisma.project.update({
        where: { id: args.projectId },
        data: { apiKey },
      });
    },
  },
};
