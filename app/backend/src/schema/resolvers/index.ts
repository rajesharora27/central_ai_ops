import { authResolvers } from '../../modules/auth/auth.resolver';
import { artifactResolvers } from '../../modules/artifact/artifact.resolver';
import { projectResolvers } from '../../modules/project/project.resolver';
import { aiAuthoringResolvers } from '../../modules/ai-authoring/ai-authoring.resolver';
import { auditResolvers } from '../../modules/audit/audit.resolver';
import GraphQLJSON from './json-scalar';

export const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    ...authResolvers.Query,
    ...artifactResolvers.Query,
    ...projectResolvers.Query,
    ...auditResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...artifactResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...aiAuthoringResolvers.Mutation,
  },

  GovernanceArtifact: artifactResolvers.GovernanceArtifact,
  Project: projectResolvers.Project,
  ProjectArtifactAssignment: projectResolvers.ProjectArtifactAssignment,
  ComplianceCheck: projectResolvers.ComplianceCheck,
  GovernanceAuditLog: auditResolvers.GovernanceAuditLog,
};
