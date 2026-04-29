import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
export type GraphQLContext = {
    prisma: PrismaClient;
    userId?: string;
    isAdmin?: boolean;
};
export declare function createContext(opts?: {
    req?: {
        headers?: Record<string, string | string[] | undefined>;
    };
}): Promise<GraphQLContext>;
export declare function disconnectPrisma(): Promise<void>;
//# sourceMappingURL=context.d.ts.map