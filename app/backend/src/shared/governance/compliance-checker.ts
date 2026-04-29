import fs from 'fs';
import path from 'path';
import { PrismaClient, ComplianceStatus } from '@prisma/client';
import { computeContentHash } from '../utils/hash';

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

export async function checkProjectCompliance(
  prisma: PrismaClient,
  projectId: string,
  governanceRoot: string
): Promise<ComplianceResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignments: {
        where: { isRequired: true },
        include: { artifact: true },
      },
    },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  if (!project.repoPath) {
    return {
      status: 'UNKNOWN',
      score: 0,
      summary: 'Project has no repository path configured',
      artifacts: [],
    };
  }

  const details: ArtifactComplianceDetail[] = [];

  for (const assignment of project.assignments) {
    const artifact = assignment.artifact;
    const detail: ArtifactComplianceDetail = {
      artifactId: artifact.id,
      artifactName: artifact.name,
      artifactType: artifact.type,
      status: 'COMPLIANT',
      reason: null,
    };

    const aiOpsGlobalPath = path.join(project.repoPath, '.ai_ops', 'global');
    const symlinkExists = fs.existsSync(aiOpsGlobalPath);

    if (!symlinkExists) {
      detail.status = 'NON_COMPLIANT';
      detail.reason = '.ai_ops/global directory missing — governance not bootstrapped';
      details.push(detail);
      continue;
    }

    const isSymlink = fs.lstatSync(aiOpsGlobalPath).isSymbolicLink();
    if (isSymlink) {
      const target = fs.readlinkSync(aiOpsGlobalPath);
      const resolvedTarget = path.resolve(path.dirname(aiOpsGlobalPath), target);
      const expectedTarget = path.resolve(governanceRoot);
      if (resolvedTarget !== expectedTarget) {
        detail.status = 'NON_COMPLIANT';
        detail.reason = `Symlink points to ${resolvedTarget}, expected ${expectedTarget}`;
        details.push(detail);
        continue;
      }
    }

    const artifactRelPath = artifact.filePath.startsWith('global/')
      ? artifact.filePath.slice('global/'.length)
      : artifact.filePath;
    const projectFilePath = path.join(aiOpsGlobalPath, artifactRelPath);

    if (!fs.existsSync(projectFilePath)) {
      detail.status = 'NON_COMPLIANT';
      detail.reason = `Artifact file missing at ${artifact.filePath}`;
      details.push(detail);
      continue;
    }

    const projectContent = fs.readFileSync(projectFilePath, 'utf-8');
    const projectHash = computeContentHash(projectContent);

    if (projectHash !== artifact.contentHash) {
      detail.status = 'DRIFTED';
      detail.reason = 'Content hash mismatch — file has been modified locally or central has updated';
      details.push(detail);
      continue;
    }

    details.push(detail);
  }

  const total = details.length;
  if (total === 0) {
    return {
      status: 'COMPLIANT',
      score: 100,
      summary: 'No required artifacts assigned',
      artifacts: details,
    };
  }

  const compliant = details.filter((d) => d.status === 'COMPLIANT').length;
  const drifted = details.filter((d) => d.status === 'DRIFTED').length;
  const nonCompliant = details.filter((d) => d.status === 'NON_COMPLIANT').length;
  const score = Math.round((compliant / total) * 100);

  let status: ComplianceStatus = 'COMPLIANT';
  if (nonCompliant > 0) status = 'NON_COMPLIANT';
  else if (drifted > 0) status = 'DRIFTED';

  const summary = `${compliant}/${total} artifacts compliant` +
    (drifted > 0 ? `, ${drifted} drifted` : '') +
    (nonCompliant > 0 ? `, ${nonCompliant} non-compliant` : '');

  return { status, score, summary, artifacts: details };
}
