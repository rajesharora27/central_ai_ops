import type { GraphQLContext } from '../graphql/context';
export type TokenPayload = {
    userId: string;
    isAdmin: boolean;
};
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function signToken(payload: TokenPayload): string;
export declare function verifyToken(token: string): TokenPayload | null;
export declare function requireUser(ctx: GraphQLContext): string;
export declare function requireAdmin(ctx: GraphQLContext): string;
//# sourceMappingURL=auth-helpers.d.ts.map