"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiAuthoringTypeDefs = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.aiAuthoringTypeDefs = (0, graphql_tag_1.default) `
  type AIAuthoringResponse {
    content: String!
    name: String!
    displayName: String!
    type: ArtifactType!
    confidence: Float!
    suggestions: [String!]
  }

  input AIAuthoringInput {
    prompt: String!
    type: ArtifactType
    environments: [AIEnvironment!]
    existingContent: String
    referenceArtifactIds: [ID!]
  }

  extend type Mutation {
    generateArtifactContent(input: AIAuthoringInput!): AIAuthoringResponse!
    refineArtifactContent(input: AIAuthoringInput!): AIAuthoringResponse!
  }
`;
//# sourceMappingURL=ai-authoring.typeDefs.js.map