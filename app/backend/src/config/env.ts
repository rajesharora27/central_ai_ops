import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const envConfig = {
  port: parseInt(process.env.PORT || '4100', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  governanceRoot: path.resolve(
    process.cwd(),
    process.env.GOVERNANCE_ROOT || '../../global'
  ),
  databaseUrl: process.env.DATABASE_URL || '',
  authBypass: process.env.AUTH_BYPASS === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
