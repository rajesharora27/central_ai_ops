export type ScannedArtifact = {
    name: string;
    displayName: string;
    type: 'RULE' | 'SKILL' | 'WORKFLOW' | 'COMMAND' | 'ENVIRONMENT_WRAPPER';
    filePath: string;
    contentHash: string;
    description: string | null;
};
export declare function scanGovernanceDirectory(governanceRoot: string): ScannedArtifact[];
export declare function readArtifactContent(governanceRoot: string, filePath: string): string;
export declare function writeArtifactContent(governanceRoot: string, filePath: string, content: string): void;
//# sourceMappingURL=artifact-scanner.d.ts.map