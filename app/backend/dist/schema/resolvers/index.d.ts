export declare const resolvers: {
    JSON: import("graphql").GraphQLScalarType<unknown, unknown>;
    Query: {
        auditLogs: (_: unknown, args: {
            first?: number;
            action?: import(".prisma/client").AuditAction;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<({
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
        project: (_: unknown, args: {
            id: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => import(".prisma/client").Prisma.Prisma__ProjectClient<({
            assignments: ({
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
                    metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
        }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
        projectBySlug: (_: unknown, args: {
            slug: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => import(".prisma/client").Prisma.Prisma__ProjectClient<({
            assignments: ({
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
                    metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
        }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
        projects: (_: unknown, args: {
            first?: number;
            after?: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<import("../../shared/utils/pagination").Connection<{
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
                    metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
        }>>;
        complianceDashboard: (_: unknown, __: unknown, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
                };
            } & {
                id: string;
                createdAt: Date;
                projectId: string;
                details: import("@prisma/client/runtime/client").JsonValue | null;
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
                        metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
            })[];
        }>;
        artifact: (_: unknown, args: {
            id: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<({
            assignments: ({
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        artifacts: (_: unknown, args: {
            first?: number;
            after?: string;
            filter?: {
                type?: import(".prisma/client").ArtifactType;
                environment?: import(".prisma/client").AIEnvironment;
                isActive?: boolean;
                search?: string;
            };
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<import("../../shared/utils/pagination").Connection<{
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }>>;
        artifactByPath: (_: unknown, args: {
            filePath: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
        } | null>;
        me: (_: unknown, __: unknown, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            username: string;
            email: string | null;
            passwordHash: string;
            isAdmin: boolean;
        } | null>;
    };
    Mutation: {
        generateArtifactContent: (_: unknown, args: {
            input: {
                prompt: string;
                type?: import(".prisma/client").ArtifactType;
                environments?: string[];
                existingContent?: string;
                referenceArtifactIds?: string[];
            };
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
            confidence: number;
            suggestions: never[];
            content: string;
            name: string;
            displayName: string;
            type: import(".prisma/client").ArtifactType;
        }>;
        refineArtifactContent: (_: unknown, args: {
            input: {
                prompt: string;
                type?: import(".prisma/client").ArtifactType;
                existingContent?: string;
                referenceArtifactIds?: string[];
            };
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
            confidence: number;
            suggestions: never[];
            content: string;
            name: string;
            displayName: string;
            type: import(".prisma/client").ArtifactType;
        }>;
        createProject: (_: unknown, args: {
            input: {
                name: string;
                slug: string;
                repoPath?: string;
                repoUrl?: string;
                description?: string;
                metadata?: unknown;
            };
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
        }>;
        deleteProject: (_: unknown, args: {
            id: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<boolean>;
        assignArtifactToProject: (_: unknown, args: {
            input: {
                projectId: string;
                artifactId: string;
                environments: import(".prisma/client").AIEnvironment[];
                isRequired?: boolean;
                overridePolicy?: string;
            };
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
                metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<boolean>;
        bulkAssignArtifacts: (_: unknown, args: {
            projectId: string;
            artifactIds: string[];
            environments: import(".prisma/client").AIEnvironment[];
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<({
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
                metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
            details: import("../../shared/governance/compliance-checker").ArtifactComplianceDetail[];
            status: import(".prisma/client").ComplianceStatus;
            score: number;
            summary: string;
            artifacts: import("../../shared/governance/compliance-checker").ArtifactComplianceDetail[];
            projectId: string;
        }>;
        applyGovernanceToProject: (_: unknown, args: {
            projectId: string;
            environments?: import(".prisma/client").AIEnvironment[];
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
            success: boolean;
            message: string;
            artifactsApplied: number;
        }>;
        regenerateApiKey: (_: unknown, args: {
            projectId: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
        }>;
        createArtifact: (_: unknown, args: {
            input: {
                name: string;
                displayName: string;
                type: import(".prisma/client").ArtifactType;
                description?: string;
                environments: import(".prisma/client").AIEnvironment[];
                content: string;
                metadata?: unknown;
            };
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
        }>;
        updateArtifact: (_: unknown, args: {
            id: string;
            input: {
                displayName?: string;
                description?: string;
                environments?: import(".prisma/client").AIEnvironment[];
                content?: string;
                metadata?: unknown;
                isActive?: boolean;
            };
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
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
        }>;
        deleteArtifact: (_: unknown, args: {
            id: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<boolean>;
        syncArtifactsFromDisk: (_: unknown, __: unknown, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<import("../../shared/governance/sync-engine").SyncResult>;
        login: (_: unknown, args: {
            username: string;
            password: string;
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => Promise<{
            token: string;
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                username: string;
                email: string | null;
                passwordHash: string;
                isAdmin: boolean;
            };
        }>;
    };
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
        }, _: unknown, ctx: import("../../shared/graphql/context").GraphQLContext) => import(".prisma/client").Prisma.PrismaPromise<({
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
                metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
        }, ctx: import("../../shared/graphql/context").GraphQLContext) => import(".prisma/client").Prisma.PrismaPromise<({
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
            };
        } & {
            id: string;
            createdAt: Date;
            projectId: string;
            details: import("@prisma/client/runtime/client").JsonValue | null;
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
    GovernanceAuditLog: {
        createdAt: (parent: {
            createdAt: Date;
        }) => string;
    };
};
//# sourceMappingURL=index.d.ts.map