"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditTypeDefs = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.auditTypeDefs = (0, graphql_tag_1.default) `
  enum AuditAction {
    CREATE
    UPDATE
    DELETE
    VERIFY
    SYNC
    APPLY
  }

  type GovernanceAuditLog {
    id: ID!
    action: AuditAction!
    userId: String
    artifactId: String
    projectId: String
    details: JSON
    artifact: GovernanceArtifact
    project: Project
    createdAt: String!
  }

  extend type Query {
    auditLogs(first: Int, action: AuditAction): [GovernanceAuditLog!]!
  }
`;
//# sourceMappingURL=audit.typeDefs.js.map