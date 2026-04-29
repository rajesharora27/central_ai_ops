import { PrismaClient } from '@prisma/client';
export type SyncResult = {
    added: number;
    updated: number;
    removed: number;
    errors: string[];
};
export declare function syncArtifactsFromDisk(prisma: PrismaClient, governanceRoot: string): Promise<SyncResult>;
//# sourceMappingURL=sync-engine.d.ts.map