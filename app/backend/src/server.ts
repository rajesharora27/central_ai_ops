import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { expressMiddleware } from '@as-integrations/express5';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

import { envConfig } from './config/env';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { createContext, disconnectPrisma, prisma } from './shared/graphql/context';
import { governanceRouter } from './routes/governance-api';
import { syncArtifactsFromDisk } from './shared/governance/sync-engine';
import { seedAdminUser } from './modules/auth/seed-admin';

async function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.use(helmet({
    contentSecurityPolicy: envConfig.isProd ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }));

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  app.use(limiter);

  const corsOrigin = envConfig.corsOrigin === '*' ? true : envConfig.corsOrigin;
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Apollo-Require-Preflight'],
    methods: ['GET', 'POST', 'OPTIONS'],
  }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/governance', governanceRouter);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const apollo = new ApolloServer({
    schema,
    csrfPrevention: false,
    introspection: envConfig.isDev,
    plugins: [
      envConfig.isDev
        ? ApolloServerPluginLandingPageLocalDefault({ includeCookies: true })
        : ApolloServerPluginLandingPageProductionDefault({ footer: false }),
    ],
  });
  await apollo.start();

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }) => createContext({ req: req as express.Request }),
    }) as express.RequestHandler
  );

  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  if (process.env.SERVE_FRONTEND === 'true' && fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist, {
      maxAge: '1y',
      setHeaders: (res, filepath) => {
        if (filepath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/graphql') || req.path.startsWith('/api/') || req.path.startsWith('/health')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  const httpServer = createServer(app);

  const shutdown = async (signal: string) => {
    console.info(`[Server] ${signal} received, shutting down...`);
    await apollo.stop();
    httpServer.close();
    await disconnectPrisma();
  };

  return { app, httpServer, shutdown };
}

const isDirectRun = typeof require === 'function' && typeof module !== 'undefined' && require.main === module;

if (isDirectRun) {
  createApp().then(async ({ httpServer, shutdown }) => {
    process.once('SIGINT', () => void shutdown('SIGINT'));
    process.once('SIGTERM', () => void shutdown('SIGTERM'));

    // Seed admin user on startup
    try {
      await seedAdminUser(prisma);
    } catch (err) {
      console.error('[Server] Admin seed failed:', err);
    }

    // Initial sync: populate DB from governance files on startup
    console.info('[Server] Syncing governance artifacts from disk...');
    try {
      const result = await syncArtifactsFromDisk(prisma, envConfig.governanceRoot);
      console.info(`[Server] Sync complete: ${result.added} added, ${result.updated} updated, ${result.removed} deactivated`);
    } catch (err) {
      console.error('[Server] Sync failed:', err);
    }

    httpServer.listen(envConfig.port, envConfig.host, () => {
      const host = envConfig.host === '0.0.0.0' ? 'localhost' : envConfig.host;
      console.info(`Governance API ready at http://${host}:${envConfig.port}/graphql`);
      console.info(`REST API at http://${host}:${envConfig.port}/api/governance/health`);
    });
  });
}

export { createApp };
