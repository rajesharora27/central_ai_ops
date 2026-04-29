import { AuditAction } from '@prisma/client';
import { GraphQLContext } from '../../shared/graphql/context';

export const auditResolvers = {
  GovernanceAuditLog: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },

  Query: {
    auditLogs: async (
      _: unknown,
      args: { first?: number; action?: AuditAction },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.governanceAuditLog.findMany({
        where: args.action ? { action: args.action } : {},
        take: args.first ?? 50,
        orderBy: { createdAt: 'desc' },
        include: { artifact: true, project: true },
      });
    },
  },
};
