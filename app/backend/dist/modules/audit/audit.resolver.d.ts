import { AuditAction } from '@prisma/client';
import { GraphQLContext } from '../../shared/graphql/context';
export declare const auditResolvers: {
    GovernanceAuditLog: {
        createdAt: (parent: {
            createdAt: Date;
        }) => string;
    };
    Query: {
        auditLogs: (_: unknown, args: {
            first?: number;
            action?: AuditAction;
        }, ctx: GraphQLContext) => Promise<({
            project: {
                name: string;
                id: string;
                description: string | null;
                isActive: boolean;
                metadata: import("@prisma/client/runtime/client").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                repoPath: string | null;
                repoUrl: string | null;
                lastVerifiedAt: Date | null;
                complianceStatus: import(".prisma/client").$Enums.ComplianceStatus;
                complianceScore: number | null;
                apiKey: string | null;
            } | null;
            artifact: {
                name: string;
                id: string;
                displayName: string;
                type: import(".prisma/client").$Enums.ArtifactType;
                description: string | null;
                filePath: string;
                contentHash: string;
                environments: import(".prisma/client").$Enums.AIEnvironment[];
                isActive: boolean;
                version: number;
                metadata: import("@prisma/client/runtime/client").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            projectId: string | null;
            artifactId: string | null;
            action: import(".prisma/client").$Enums.AuditAction;
            userId: string | null;
            details: import("@prisma/client/runtime/client").JsonValue | null;
        })[]>;
    };
};
//# sourceMappingURL=audit.resolver.d.ts.map