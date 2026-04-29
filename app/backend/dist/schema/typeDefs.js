"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const auth_typeDefs_1 = require("../modules/auth/auth.typeDefs");
const artifact_typeDefs_1 = require("../modules/artifact/artifact.typeDefs");
const project_typeDefs_1 = require("../modules/project/project.typeDefs");
const ai_authoring_typeDefs_1 = require("../modules/ai-authoring/ai-authoring.typeDefs");
const audit_typeDefs_1 = require("../modules/audit/audit.typeDefs");
exports.typeDefs = [
    auth_typeDefs_1.authTypeDefs,
    artifact_typeDefs_1.artifactTypeDefs,
    project_typeDefs_1.projectTypeDefs,
    ai_authoring_typeDefs_1.aiAuthoringTypeDefs,
    audit_typeDefs_1.auditTypeDefs,
];
//# sourceMappingURL=typeDefs.js.map