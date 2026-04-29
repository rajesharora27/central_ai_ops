import { ArtifactType } from '@prisma/client';
import { GraphQLContext } from '../../shared/graphql/context';
export declare const aiAuthoringResolvers: {
    Mutation: {
        generateArtifactContent: (_: unknown, args: {
            input: {
                prompt: string;
                type?: ArtifactType;
                environments?: string[];
                existingContent?: string;
                referenceArtifactIds?: string[];
            };
        }, ctx: GraphQLContext) => Promise<{
            confidence: number;
            suggestions: never[];
            content: string;
            name: string;
            displayName: string;
            type: ArtifactType;
        }>;
        refineArtifactContent: (_: unknown, args: {
            input: {
                prompt: string;
                type?: ArtifactType;
                existingContent?: string;
                referenceArtifactIds?: string[];
            };
        }, ctx: GraphQLContext) => Promise<{
            confidence: number;
            suggestions: never[];
            content: string;
            name: string;
            displayName: string;
            type: ArtifactType;
        }>;
    };
};
//# sourceMappingURL=ai-authoring.resolver.d.ts.map