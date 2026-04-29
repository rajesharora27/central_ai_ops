import { ArtifactType, AIEnvironment, Prisma } from '@prisma/client';
import { GraphQLContext } from '../../shared/graphql/context';
export declare const artifactResolvers: {
    GovernanceArtifact: {
        content: (parent: {
            filePath: string;
        }) => string;
        createdAt: (parent: {
            createdAt: Date;
        }) => string;
        updatedAt: (parent: {
            updatedAt: Date;
        }) => string;
    };
    Query: {
        artifact: (_: unknown, args: {
            id: string;
        }, ctx: GraphQLContext) => Promise<({
            assignments: ({
                project: {
                    name: string;
                    id: string;
                    description: string | null;
                    isActive: boolean;
                    metadata: Prisma.JsonValue | null;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    repoPath: string | null;
                    repoUrl: string | null;
                    lastVerifiedAt: Date | null;
                    complianceStatus: import(".prisma/client").$Enums.ComplianceStatus;
                    complianceScore: number | null;
                    apiKey: string | null;
                };
            } & {
                id: string;
                environments: import(".prisma/client").$Enums.AIEnvironment[];
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                artifactId: string;
                isRequired: boolean;
                overridePolicy: string | null;
            })[];
        } & {
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
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        artifacts: (_: unknown, args: {
            first?: number;
            after?: string;
            filter?: {
                type?: ArtifactType;
                environment?: AIEnvironment;
                isActive?: boolean;
                search?: string;
            };
        }, ctx: GraphQLContext) => Promise<import("../../shared/utils/pagination").Connection<{
            assignments: {
                id: string;
                environments: import(".prisma/client").$Enums.AIEnvironment[];
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                artifactId: string;
                isRequired: boolean;
                overridePolicy: string | null;
            }[];
        } & {
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
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }>>;
        artifactByPath: (_: unknown, args: {
            filePath: string;
        }, ctx: GraphQLContext) => Promise<{
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
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
    };
    Mutation: {
        createArtifact: (_: unknown, args: {
            input: {
                name: string;
                displayName: string;
                type: ArtifactType;
                description?: string;
                environments: AIEnvironment[];
                content: string;
                metadata?: unknown;
            };
        }, ctx: GraphQLContext) => Promise<{
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
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }>;
        updateArtifact: (_: unknown, args: {
            id: string;
            input: {
                displayName?: string;
                description?: string;
                environments?: AIEnvironment[];
                content?: string;
                metadata?: unknown;
                isActive?: boolean;
            };
        }, ctx: GraphQLContext) => Promise<{
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
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }>;
        deleteArtifact: (_: unknown, args: {
            id: string;
        }, ctx: GraphQLContext) => Promise<boolean>;
        syncArtifactsFromDisk: (_: unknown, __: unknown, ctx: GraphQLContext) => Promise<import("../../shared/governance/sync-engine").SyncResult>;
    };
};
//# sourceMappingURL=artifact.resolver.d.ts.map