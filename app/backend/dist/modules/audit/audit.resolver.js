"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditResolvers = void 0;
exports.auditResolvers = {
    GovernanceAuditLog: {
        createdAt: (parent) => parent.createdAt.toISOString(),
    },
    Query: {
        auditLogs: async (_, args, ctx) => {
            return ctx.prisma.governanceAuditLog.findMany({
                where: args.action ? { action: args.action } : {},
                take: args.first ?? 50,
                orderBy: { createdAt: 'desc' },
                include: { artifact: true, project: true },
            });
        },
    },
};
//# sourceMappingURL=audit.resolver.js.map