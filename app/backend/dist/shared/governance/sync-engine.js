"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncArtifactsFromDisk = syncArtifactsFromDisk;
const artifact_scanner_1 = require("./artifact-scanner");
async function syncArtifactsFromDisk(prisma, governanceRoot) {
    const result = { added: 0, updated: 0, removed: 0, errors: [] };
    let scanned;
    try {
        scanned = (0, artifact_scanner_1.scanGovernanceDirectory)(governanceRoot);
    }
    catch (err) {
        result.errors.push(`Failed to scan directory: ${err}`);
        return result;
    }
    const existing = await prisma.governanceArtifact.findMany();
    const existingByPath = new Map(existing.map((a) => [a.filePath, a]));
    const scannedPaths = new Set(scanned.map((s) => s.filePath));
    for (const artifact of scanned) {
        const existingArtifact = existingByPath.get(artifact.filePath);
        try {
            if (!existingArtifact) {
                await prisma.governanceArtifact.create({
                    data: {
                        name: artifact.name,
                        displayName: artifact.displayName,
                        type: artifact.type,
                        description: artifact.description,
                        filePath: artifact.filePath,
                        contentHash: artifact.contentHash,
                        environments: ['ALL'],
                        isActive: true,
                    },
                });
                result.added++;
            }
            else if (existingArtifact.contentHash !== artifact.contentHash) {
                await prisma.governanceArtifact.update({
                    where: { id: existingArtifact.id },
                    data: {
                        contentHash: artifact.contentHash,
                        description: artifact.description,
                        version: { increment: 1 },
                    },
                });
                result.updated++;
            }
        }
        catch (err) {
            result.errors.push(`Failed to sync ${artifact.filePath}: ${err}`);
        }
    }
    for (const existing of existingByPath.values()) {
        if (!scannedPaths.has(existing.filePath)) {
            try {
                await prisma.governanceArtifact.update({
                    where: { id: existing.id },
                    data: { isActive: false },
                });
                result.removed++;
            }
            catch (err) {
                result.errors.push(`Failed to deactivate ${existing.filePath}: ${err}`);
            }
        }
    }
    return result;
}
//# sourceMappingURL=sync-engine.js.map