import gql from 'graphql-tag';

export const aiAuthoringTypeDefs = gql`
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
