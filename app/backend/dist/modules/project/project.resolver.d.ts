import { AIEnvironment, Prisma } from '@prisma/client';
import { GraphQLContext } from '../../shared/graphql/context';
export declare const projectResolvers: {
    Project: {
        createdAt: (parent: {
            createdAt: Date;
        }) => string;
        updatedAt: (parent: {
            updatedAt: Date;
        }) => string;
        lastVerifiedAt: (parent: {
            lastVerifiedAt: Date | null;
        }) => string | null;
        assignments: (parent: {
            id: string;
        }, _: unknown, ctx: GraphQLContext) => Prisma.PrismaPromise<({
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
                metadata: Prisma.JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
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
        })[]>;
        recentChecks: (parent: {
            id: string;
        }, args: {
            first?: number;
        }, ctx: GraphQLContext) => Prisma.PrismaPromise<({
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
            createdAt: Date;
            projectId: string;
            details: Prisma.JsonValue | null;
            status: import(".prisma/client").$Enums.ComplianceStatus;
            score: number | null;
            summary: string | null;
            triggeredBy: string | null;
            duration: number | null;
        })[]>;
    };
    ProjectArtifactAssignment: {
        createdAt: (parent: {
            createdAt: Date;
        }) => string;
        updatedAt: (parent: {
            updatedAt: Date;
        }) => string;
    };
    ComplianceCheck: {
        createdAt: (parent: {
            createdAt: Date;
        }) => string;
    };
    Query: {
        project: (_: unknown, args: {
            id: string;
        }, ctx: GraphQLContext) => Prisma.Prisma__ProjectClient<({
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
                    metadata: Prisma.JsonValue | null;
                    createdAt: Date;
                    updatedAt: Date;
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
        }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
        projectBySlug: (_: unknown, args: {
            slug: string;
        }, ctx: GraphQLContext) => Prisma.Prisma__ProjectClient<({
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
                    metadata: Prisma.JsonValue | null;
                    createdAt: Date;
                    updatedAt: Date;
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
        }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
        projects: (_: unknown, args: {
            first?: number;
            after?: string;
        }, ctx: GraphQLContext) => Promise<import("../../shared/utils/pagination").Connection<{
            assignments: ({
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
                    metadata: Prisma.JsonValue | null;
                    createdAt: Date;
                    updatedAt: Date;
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
        }>>;
        complianceDashboard: (_: unknown, __: unknown, ctx: GraphQLContext) => Promise<{
            totalProjects: number;
            compliantCount: number;
            driftedCount: number;
            nonCompliantCount: number;
            unknownCount: number;
            totalArtifacts: number;
            activeArtifacts: number;
            recentChecks: ({
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
                createdAt: Date;
                projectId: string;
                details: Prisma.JsonValue | null;
                status: import(".prisma/client").$Enums.ComplianceStatus;
                score: number | null;
                summary: string | null;
                triggeredBy: string | null;
                duration: number | null;
            })[];
            projects: ({
                assignments: ({
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
                        metadata: Prisma.JsonValue | null;
                        createdAt: Date;
                        updatedAt: Date;
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
            })[];
        }>;
    };
    Mutation: {
        createProject: (_: unknown, args: {
            input: {
                name: string;
                slug: string;
                repoPath?: string;
                repoUrl?: string;
                description?: string;
                metadata?: unknown;
            };
        }, ctx: GraphQLContext) => Promise<{
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
        }>;
        updateProject: (_: unknown, args: {
            id: string;
            input: {
                name: string;
                slug: string;
                repoPath?: string;
                repoUrl?: string;
                description?: string;
                metadata?: unknown;
            };
        }, ctx: GraphQLContext) => Promise<{
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
        }>;
        deleteProject: (_: unknown, args: {
            id: string;
        }, ctx: GraphQLContext) => Promise<boolean>;
        assignArtifactToProject: (_: unknown, args: {
            input: {
                projectId: string;
                artifactId: string;
                environments: AIEnvironment[];
                isRequired?: boolean;
                overridePolicy?: string;
            };
        }, ctx: GraphQLContext) => Promise<{
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
                metadata: Prisma.JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
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
        }>;
        removeArtifactFromProject: (_: unknown, args: {
            assignmentId: string;
        }, ctx: GraphQLContext) => Promise<boolean>;
        bulkAssignArtifacts: (_: unknown, args: {
            projectId: string;
            artifactIds: string[];
            environments: AIEnvironment[];
        }, ctx: GraphQLContext) => Promise<({
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
                metadata: Prisma.JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
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
        })[]>;
        verifyProjectCompliance: (_: unknown, args: {
            projectId: string;
        }, ctx: GraphQLContext) => Promise<{
            details: import("../../shared/governance/compliance-checker").ArtifactComplianceDetail[];
            status: import(".prisma/client").ComplianceStatus;
            score: number;
            summary: string;
            artifacts: import("../../shared/governance/compliance-checker").ArtifactComplianceDetail[];
            projectId: string;
        }>;
        applyGovernanceToProject: (_: unknown, args: {
            projectId: string;
            environments?: AIEnvironment[];
        }, ctx: GraphQLContext) => Promise<{
            success: boolean;
            message: string;
            artifactsApplied: number;
        }>;
        regenerateApiKey: (_: unknown, args: {
            projectId: string;
        }, ctx: GraphQLContext) => Promise<{
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
        }>;
    };
};
//# sourceMappingURL=project.resolver.d.ts.map