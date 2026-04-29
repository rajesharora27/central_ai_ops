import { PrismaClient, ComplianceStatus } from '@prisma/client';
export type ArtifactComplianceDetail = {
    artifactId: string;
    artifactName: string;
    artifactType: string;
    status: ComplianceStatus;
    reason: string | null;
};
export type ComplianceResult = {
    status: ComplianceStatus;
    score: number;
    summary: string;
    artifacts: ArtifactComplianceDetail[];
};
export declare function checkProjectCompliance(prisma: PrismaClient, projectId: string, governanceRoot: string): Promise<ComplianceResult>;
//# sourceMappingURL=compliance-checker.d.ts.map