import { authTypeDefs } from '../modules/auth/auth.typeDefs';
import { artifactTypeDefs } from '../modules/artifact/artifact.typeDefs';
import { projectTypeDefs } from '../modules/project/project.typeDefs';
import { aiAuthoringTypeDefs } from '../modules/ai-authoring/ai-authoring.typeDefs';
import { auditTypeDefs } from '../modules/audit/audit.typeDefs';

export const typeDefs = [
  authTypeDefs,
  artifactTypeDefs,
  projectTypeDefs,
  aiAuthoringTypeDefs,
  auditTypeDefs,
];
