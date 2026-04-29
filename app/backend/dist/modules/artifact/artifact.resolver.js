"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artifactResolvers = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../../config/env");
const auth_helpers_1 = require("../../shared/auth/auth-helpers");
const artifact_scanner_1 = require("../../shared/governance/artifact-scanner");
const sync_engine_1 = require("../../shared/governance/sync-engine");
const hash_1 = require("../../shared/utils/hash");
const pagination_1 = require("../../shared/utils/pagination");
const TYPE_TO_PATH_PREFIX = {
    RULE: 'global/rules',
    SKILL: 'global/skills',
    WORKFLOW: 'global/workflows',
    COMMAND: 'global/commands',
    ENVIRONMENT_WRAPPER: 'global',
};
function buildFilePath(type, name) {
    const prefix = TYPE_TO_PATH_PREFIX[type];
    if (type === 'SKILL') {
        return `${prefix}/${name}/SKILL.md`;
    }
    return `${prefix}/${name}.md`;
}
exports.artifactResolvers = {
    GovernanceArtifact: {
        content: (parent) => {
            try {
                return (0, artifact_scanner_1.readArtifactContent)(env_1.envConfig.governanceRoot, parent.filePath);
            }
            catch {
                return '';
            }
        },
        createdAt: (parent) => parent.createdAt.toISOString(),
        updatedAt: (parent) => parent.updatedAt.toISOString(),
    },
    Query: {
        artifact: async (_, args, ctx) => {
            return ctx.prisma.governanceArtifact.findUnique({
                where: { id: args.id },
                include: { assignments: { include: { project: true } } },
            });
        },
        artifacts: async (_, args, ctx) => {
            const where = {};
            if (args.filter?.type)
                where.type = args.filter.type;
            if (args.filter?.isActive !== undefined)
                where.isActive = args.filter.isActive;
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
            const cursor = args.after ? { id: (0, pagination_1.decodeCursor)(args.after) } : undefined;
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
            return (0, pagination_1.buildConnection)(items, totalCount, { first: args.first, after: args.after });
        },
        artifactByPath: async (_, args, ctx) => {
            return ctx.prisma.governanceArtifact.findUnique({
                where: { filePath: args.filePath },
            });
        },
    },
    Mutation: {
        createArtifact: async (_, args, ctx) => {
            (0, auth_helpers_1.requireUser)(ctx);
            const { input } = args;
            const filePath = buildFilePath(input.type, input.name);
            (0, artifact_scanner_1.writeArtifactContent)(env_1.envConfig.governanceRoot, filePath, input.content);
            const contentHash = (0, hash_1.computeContentHash)(input.content);
            const artifact = await ctx.prisma.governanceArtifact.create({
                data: {
                    name: input.name,
                    displayName: input.displayName,
                    type: input.type,
                    description: input.description || null,
                    filePath,
                    contentHash,
                    environments: input.environments,
                    metadata: input.metadata ?? client_1.Prisma.JsonNull,
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
        updateArtifact: async (_, args, ctx) => {
            (0, auth_helpers_1.requireUser)(ctx);
            const { id, input } = args;
            const existing = await ctx.prisma.governanceArtifact.findUnique({ where: { id } });
            if (!existing)
                throw new Error('Artifact not found');
            const updateData = {};
            if (input.displayName !== undefined)
                updateData.displayName = input.displayName;
            if (input.description !== undefined)
                updateData.description = input.description;
            if (input.environments !== undefined)
                updateData.environments = input.environments;
            if (input.isActive !== undefined)
                updateData.isActive = input.isActive;
            if (input.metadata !== undefined)
                updateData.metadata = input.metadata;
            if (input.content !== undefined) {
                (0, artifact_scanner_1.writeArtifactContent)(env_1.envConfig.governanceRoot, existing.filePath, input.content);
                updateData.contentHash = (0, hash_1.computeContentHash)(input.content);
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
        deleteArtifact: async (_, args, ctx) => {
            (0, auth_helpers_1.requireUser)(ctx);
            const artifact = await ctx.prisma.governanceArtifact.findUnique({ where: { id: args.id } });
            if (!artifact)
                throw new Error('Artifact not found');
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
        syncArtifactsFromDisk: async (_, __, ctx) => {
            (0, auth_helpers_1.requireUser)(ctx);
            const result = await (0, sync_engine_1.syncArtifactsFromDisk)(ctx.prisma, env_1.envConfig.governanceRoot);
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
//# sourceMappingURL=artifact.resolver.js.map