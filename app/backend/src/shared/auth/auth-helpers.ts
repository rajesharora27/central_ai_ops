import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../config/env';
import type { GraphQLContext } from '../graphql/context';

export type TokenPayload = {
  userId: string;
  isAdmin: boolean;
};

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, envConfig.jwtSecret, {
    expiresIn: envConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, envConfig.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function requireUser(ctx: GraphQLContext): string {
  if (envConfig.authBypass) return 'bypass-user';
  if (!ctx.userId) throw new Error('Authentication required');
  return ctx.userId;
}

export function requireAdmin(ctx: GraphQLContext): string {
  if (envConfig.authBypass) return 'bypass-admin';
  if (!ctx.userId) throw new Error('Authentication required');
  if (!ctx.isAdmin) throw new Error('Admin access required');
  return ctx.userId;
}
