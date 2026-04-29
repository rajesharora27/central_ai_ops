import gql from 'graphql-tag';

export const authTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
    isAdmin: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
  }
`;
