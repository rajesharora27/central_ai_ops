"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.governanceRouter = void 0;
const express_1 = require("express");
const context_1 = require("../shared/graphql/context");
const env_1 = require("../config/env");
const compliance_checker_1 = require("../shared/governance/compliance-checker");
const sync_engine_1 = require("../shared/governance/sync-engine");
const artifact_scanner_1 = require("../shared/governance/artifact-scanner");
exports.governanceRouter = (0, express_1.Router)();
async function authenticateApiKey(req) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey)
        return null;
    const project = await context_1.prisma.project.findUnique({ where: { apiKey } });
    return project?.id ?? null;
}
exports.governanceRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.governanceRouter.post('/verify', async (req, res) => {
    try {
        const { projectSlug } = req.body;
        const apiKeyProjectId = await authenticateApiKey(req);
        let project;
        if (apiKeyProjectId) {
            project = await context_1.prisma.project.findUnique({ where: { id: apiKeyProjectId } });
        }
        else if (projectSlug) {
            project = await context_1.prisma.project.findUnique({ where: { slug: projectSlug } });
        }
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const start = Date.now();
        const result = await (0, compliance_checker_1.checkProjectCompliance)(context_1.prisma, project.id, env_1.envConfig.governanceRoot);
        const duration = Date.now() - start;
        await context_1.prisma.complianceCheck.create({
            data: {
                projectId: project.id,
                status: result.status,
                score: result.score,
                summary: result.summary,
                details: result.artifacts,
                triggeredBy: apiKeyProjectId ? 'ci' : 'api',
                duration,
            },
        });
        await context_1.prisma.project.update({
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: message });
    }
});
exports.governanceRouter.get('/config/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const project = await context_1.prisma.project.findUnique({
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
                content = (0, artifact_scanner_1.readArtifactContent)(env_1.envConfig.governanceRoot, artifact.filePath);
            }
            catch { /* file might be missing */ }
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: message });
    }
});
exports.governanceRouter.post('/sync', async (req, res) => {
    try {
        const result = await (0, sync_engine_1.syncArtifactsFromDisk)(context_1.prisma, env_1.envConfig.governanceRoot);
        await context_1.prisma.governanceAuditLog.create({
            data: {
                action: 'SYNC',
                details: result,
            },
        });
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: message });
    }
});
//# sourceMappingURL=governance-api.js.map