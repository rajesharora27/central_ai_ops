import { PrismaClient, ArtifactType } from '@prisma/client';
import { scanGovernanceDirectory, ScannedArtifact } from './artifact-scanner';

export type SyncResult = {
  added: number;
  updated: number;
  removed: number;
  errors: string[];
};

export async function syncArtifactsFromDisk(
  prisma: PrismaClient,
  governanceRoot: string
): Promise<SyncResult> {
  const result: SyncResult = { added: 0, updated: 0, removed: 0, errors: [] };

  let scanned: ScannedArtifact[];
  try {
    scanned = scanGovernanceDirectory(governanceRoot);
  } catch (err) {
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
            type: artifact.type as ArtifactType,
            description: artifact.description,
            filePath: artifact.filePath,
            contentHash: artifact.contentHash,
            environments: ['ALL'],
            isActive: true,
          },
        });
        result.added++;
      } else if (existingArtifact.contentHash !== artifact.contentHash) {
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
    } catch (err) {
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
      } catch (err) {
        result.errors.push(`Failed to deactivate ${existing.filePath}: ${err}`);
      }
    }
  }

  return result;
}
