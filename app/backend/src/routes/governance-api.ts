import { Router, Request, Response } from 'express';
import { prisma } from '../shared/graphql/context';
import { envConfig } from '../config/env';
import { checkProjectCompliance } from '../shared/governance/compliance-checker';
import { syncArtifactsFromDisk } from '../shared/governance/sync-engine';
import { readArtifactContent } from '../shared/governance/artifact-scanner';
import { Prisma } from '@prisma/client';

export const governanceRouter = Router();

async function authenticateApiKey(req: Request): Promise<string | null> {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  if (!apiKey) return null;
  const project = await prisma.project.findUnique({ where: { apiKey } });
  return project?.id ?? null;
}

governanceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

governanceRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const { projectSlug } = req.body as { projectSlug?: string };
    const apiKeyProjectId = await authenticateApiKey(req);

    let project;
    if (apiKeyProjectId) {
      project = await prisma.project.findUnique({ where: { id: apiKeyProjectId } });
    } else if (projectSlug) {
      project = await prisma.project.findUnique({ where: { slug: projectSlug } });
    }

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const start = Date.now();
    const result = await checkProjectCompliance(prisma, project.id, envConfig.governanceRoot);
    const duration = Date.now() - start;

    await prisma.complianceCheck.create({
      data: {
        projectId: project.id,
        status: result.status,
        score: result.score,
        summary: result.summary,
        details: result.artifacts as unknown as Prisma.InputJsonValue,
        triggeredBy: apiKeyProjectId ? 'ci' : 'api',
        duration,
      },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        complianceStatus: result.status,
        complianceScore: result.score,
        lastVerifiedAt: new Date(),
      },
    });

    res.json({
      status: result.status,
      score: result.score,
      summary: result.summary,
      artifacts: result.artifacts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

governanceRouter.get('/config/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        assignments: {
          where: { isRequired: true },
          include: { artifact: true },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const artifacts = [];
    for (const assignment of project.assignments) {
      const artifact = assignment.artifact;
      let content = '';
      try {
        content = readArtifactContent(envConfig.governanceRoot, artifact.filePath);
      } catch { /* file might be missing */ }

      artifacts.push({
        type: artifact.type,
        name: artifact.name,
        path: artifact.filePath,
        environments: assignment.environments,
        content,
      });
    }

    res.json({
      project: project.slug,
      artifacts,
      loadOrder: [
        'global/global-MASTER.md',
        'global/rules/global-*.md',
        'global/workflows/global-*.md',
        'global/commands/*.md',
        'global/skills/global-*',
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

governanceRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const result = await syncArtifactsFromDisk(prisma, envConfig.governanceRoot);
    await prisma.governanceAuditLog.create({
      data: {
        action: 'SYNC',
        details: result as unknown as Prisma.InputJsonValue,
      },
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});
