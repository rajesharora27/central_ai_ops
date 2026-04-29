"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.artifactTypeDefs = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.artifactTypeDefs = (0, graphql_tag_1.default) `
  enum ArtifactType {
    RULE
    SKILL
    WORKFLOW
    COMMAND
    ENVIRONMENT_WRAPPER
  }

  enum AIEnvironment {
    CLAUDE
    CODEX
    CURSOR
    OPENCODE
    AGENTS
    ALL
  }

  type GovernanceArtifact {
    id: ID!
    name: String!
    displayName: String!
    type: ArtifactType!
    description: String
    filePath: String!
    contentHash: String!
    environments: [AIEnvironment!]!
    isActive: Boolean!
    version: Int!
    metadata: JSON
    content: String!
    assignments: [ProjectArtifactAssignment!]!
    createdAt: String!
    updatedAt: String!
  }

  type ArtifactEdge {
    cursor: String!
    node: GovernanceArtifact!
  }

  type ArtifactConnection {
    edges: [ArtifactEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type SyncResult {
    added: Int!
    updated: Int!
    removed: Int!
    errors: [String!]!
  }

  input ArtifactInput {
    name: String!
    displayName: String!
    type: ArtifactType!
    description: String
    environments: [AIEnvironment!]!
    content: String!
    metadata: JSON
  }

  input ArtifactUpdateInput {
    displayName: String
    description: String
    environments: [AIEnvironment!]
    content: String
    metadata: JSON
    isActive: Boolean
  }

  input ArtifactFilterInput {
    type: ArtifactType
    environment: AIEnvironment
    isActive: Boolean
    search: String
  }

  scalar JSON

  extend type Query {
    artifact(id: ID!): GovernanceArtifact
    artifacts(first: Int, after: String, filter: ArtifactFilterInput): ArtifactConnection!
    artifactByPath(filePath: String!): GovernanceArtifact
  }

  extend type Mutation {
    createArtifact(input: ArtifactInput!): GovernanceArtifact!
    updateArtifact(id: ID!, input: ArtifactUpdateInput!): GovernanceArtifact!
    deleteArtifact(id: ID!): Boolean!
    syncArtifactsFromDisk: SyncResult!
  }
`;
//# sourceMappingURL=artifact.typeDefs.js.map