"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authTypeDefs = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.authTypeDefs = (0, graphql_tag_1.default) `
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
//# sourceMappingURL=auth.typeDefs.js.map