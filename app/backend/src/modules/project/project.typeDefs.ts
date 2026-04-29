import gql from 'graphql-tag';

export const projectTypeDefs = gql`
  enum ComplianceStatus {
    COMPLIANT
    DRIFTED
    NON_COMPLIANT
    UNKNOWN
    PENDING
  }

  type Project {
    id: ID!
    name: String!
    slug: String!
    repoPath: String
    repoUrl: String
    description: String
    isActive: Boolean!
    lastVerifiedAt: String
    complianceStatus: ComplianceStatus!
    complianceScore: Int
    apiKey: String
    metadata: JSON
    assignments: [ProjectArtifactAssignment!]!
    recentChecks(first: Int): [ComplianceCheck!]!
    createdAt: String!
    updatedAt: String!
  }

  type ProjectArtifactAssignment {
    id: ID!
    project: Project!
    artifact: GovernanceArtifact!
    environments: [AIEnvironment!]!
    isRequired: Boolean!
    overridePolicy: String
    createdAt: String!
    updatedAt: String!
  }

  type ComplianceCheck {
    id: ID!
    project: Project!
    status: ComplianceStatus!
    score: Int
    summary: String
    details: JSON
    triggeredBy: String
    duration: Int
    createdAt: String!
  }

  type ProjectEdge {
    cursor: String!
    node: Project!
  }

  type ProjectConnection {
    edges: [ProjectEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type VerifyResult {
    projectId: ID!
    status: ComplianceStatus!
    score: Int!
    summary: String!
    details: JSON!
    artifacts: [ArtifactComplianceDetail!]!
  }

  type ArtifactComplianceDetail {
    artifactId: ID!
    artifactName: String!
    artifactType: String!
    status: ComplianceStatus!
    reason: String
  }

  type ApplyResult {
    success: Boolean!
    message: String!
    artifactsApplied: Int!
  }

  type ComplianceDashboardData {
    totalProjects: Int!
    compliantCount: Int!
    driftedCount: Int!
    nonCompliantCount: Int!
    unknownCount: Int!
    totalArtifacts: Int!
    activeArtifacts: Int!
    recentChecks: [ComplianceCheck!]!
    projects: [Project!]!
  }

  input ProjectInput {
    name: String!
    slug: String!
    repoPath: String
    repoUrl: String
    description: String
    metadata: JSON
  }

  input AssignArtifactInput {
    projectId: ID!
    artifactId: ID!
    environments: [AIEnvironment!]!
    isRequired: Boolean
    overridePolicy: String
  }

  extend type Query {
    project(id: ID!): Project
    projectBySlug(slug: String!): Project
    projects(first: Int, after: String): ProjectConnection!
    complianceDashboard: ComplianceDashboardData!
  }

  extend type Mutation {
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    assignArtifactToProject(input: AssignArtifactInput!): ProjectArtifactAssignment!
    removeArtifactFromProject(assignmentId: ID!): Boolean!
    bulkAssignArtifacts(
      projectId: ID!
      artifactIds: [ID!]!
      environments: [AIEnvironment!]!
    ): [ProjectArtifactAssignment!]!
    verifyProjectCompliance(projectId: ID!): VerifyResult!
    applyGovernanceToProject(
      projectId: ID!
      environments: [AIEnvironment!]
    ): ApplyResult!
    regenerateApiKey(projectId: ID!): Project!
  }
`;
