"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const auth_resolver_1 = require("../../modules/auth/auth.resolver");
const artifact_resolver_1 = require("../../modules/artifact/artifact.resolver");
const project_resolver_1 = require("../../modules/project/project.resolver");
const ai_authoring_resolver_1 = require("../../modules/ai-authoring/ai-authoring.resolver");
const audit_resolver_1 = require("../../modules/audit/audit.resolver");
const json_scalar_1 = __importDefault(require("./json-scalar"));
exports.resolvers = {
    JSON: json_scalar_1.default,
    Query: {
        ...auth_resolver_1.authResolvers.Query,
        ...artifact_resolver_1.artifactResolvers.Query,
        ...project_resolver_1.projectResolvers.Query,
        ...audit_resolver_1.auditResolvers.Query,
    },
    Mutation: {
        ...auth_resolver_1.authResolvers.Mutation,
        ...artifact_resolver_1.artifactResolvers.Mutation,
        ...project_resolver_1.projectResolvers.Mutation,
        ...ai_authoring_resolver_1.aiAuthoringResolvers.Mutation,
    },
    GovernanceArtifact: artifact_resolver_1.artifactResolvers.GovernanceArtifact,
    Project: project_resolver_1.projectResolvers.Project,
    ProjectArtifactAssignment: project_resolver_1.projectResolvers.ProjectArtifactAssignment,
    ComplianceCheck: project_resolver_1.projectResolvers.ComplianceCheck,
    GovernanceAuditLog: audit_resolver_1.auditResolvers.GovernanceAuditLog,
};
//# sourceMappingURL=index.js.map