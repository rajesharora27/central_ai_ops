"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProjectCompliance = checkProjectCompliance;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const hash_1 = require("../utils/hash");
async function checkProjectCompliance(prisma, projectId, governanceRoot) {
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
    const details = [];
    for (const assignment of project.assignments) {
        const artifact = assignment.artifact;
        const detail = {
            artifactId: artifact.id,
            artifactName: artifact.name,
            artifactType: artifact.type,
            status: 'COMPLIANT',
            reason: null,
        };
        const aiOpsGlobalPath = path_1.default.join(project.repoPath, '.ai_ops', 'global');
        const symlinkExists = fs_1.default.existsSync(aiOpsGlobalPath);
        if (!symlinkExists) {
            detail.status = 'NON_COMPLIANT';
            detail.reason = '.ai_ops/global directory missing — governance not bootstrapped';
            details.push(detail);
            continue;
        }
        const isSymlink = fs_1.default.lstatSync(aiOpsGlobalPath).isSymbolicLink();
        if (isSymlink) {
            const target = fs_1.default.readlinkSync(aiOpsGlobalPath);
            const resolvedTarget = path_1.default.resolve(path_1.default.dirname(aiOpsGlobalPath), target);
            const expectedTarget = path_1.default.resolve(governanceRoot);
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
        const projectFilePath = path_1.default.join(aiOpsGlobalPath, artifactRelPath);
        if (!fs_1.default.existsSync(projectFilePath)) {
            detail.status = 'NON_COMPLIANT';
            detail.reason = `Artifact file missing at ${artifact.filePath}`;
            details.push(detail);
            continue;
        }
        const projectContent = fs_1.default.readFileSync(projectFilePath, 'utf-8');
        const projectHash = (0, hash_1.computeContentHash)(projectContent);
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
    let status = 'COMPLIANT';
    if (nonCompliant > 0)
        status = 'NON_COMPLIANT';
    else if (drifted > 0)
        status = 'DRIFTED';
    const summary = `${compliant}/${total} artifacts compliant` +
        (drifted > 0 ? `, ${drifted} drifted` : '') +
        (nonCompliant > 0 ? `, ${nonCompliant} non-compliant` : '');
    return { status, score, summary, artifacts: details };
}
//# sourceMappingURL=compliance-checker.js.map