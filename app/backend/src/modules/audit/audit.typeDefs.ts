import gql from 'graphql-tag';

export const auditTypeDefs = gql`
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
