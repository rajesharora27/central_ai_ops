import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { envConfig } from '../../config/env';

const databaseUrl = envConfig.databaseUrl || 'postgresql://postgres:postgres@localhost:5433/governance?schema=public';
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export type GraphQLContext = {
  prisma: PrismaClient;
  userId?: string;
  isAdmin?: boolean;
};

export async function createContext(opts: { req?: { headers?: Record<string, string | string[] | undefined> } } = {}): Promise<GraphQLContext> {
  const { verifyToken } = await import('../auth/auth-helpers');
  const ctx: GraphQLContext = { prisma };

  if (envConfig.authBypass) {
    ctx.userId = 'bypass-user';
    ctx.isAdmin = true;
    return ctx;
  }

  const authHeader = opts.req?.headers?.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      ctx.userId = payload.userId;
      ctx.isAdmin = payload.isAdmin;
    }
  }

  return ctx;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
}
