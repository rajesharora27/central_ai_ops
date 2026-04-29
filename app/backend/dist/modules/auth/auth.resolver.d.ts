import { GraphQLContext } from '../../shared/graphql/context';
export declare const authResolvers: {
    Query: {
        me: (_: unknown, __: unknown, ctx: GraphQLContext) => Promise<{
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
        login: (_: unknown, args: {
            username: string;
            password: string;
        }, ctx: GraphQLContext) => Promise<{
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
};
//# sourceMappingURL=auth.resolver.d.ts.map