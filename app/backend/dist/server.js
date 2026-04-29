"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const server_1 = require("@apollo/server");
const default_1 = require("@apollo/server/plugin/landingPage/default");
const express5_1 = require("@as-integrations/express5");
const schema_1 = require("@graphql-tools/schema");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const typeDefs_1 = require("./schema/typeDefs");
const resolvers_1 = require("./schema/resolvers");
const context_1 = require("./shared/graphql/context");
const governance_api_1 = require("./routes/governance-api");
const sync_engine_1 = require("./shared/governance/sync-engine");
const seed_admin_1 = require("./modules/auth/seed-admin");
async function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: env_1.envConfig.isProd ? {
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
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: 200,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
    });
    app.use(limiter);
    const corsOrigin = env_1.envConfig.corsOrigin === '*' ? true : env_1.envConfig.corsOrigin;
    app.use((0, cors_1.default)({
        origin: corsOrigin,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Apollo-Require-Preflight'],
        methods: ['GET', 'POST', 'OPTIONS'],
    }));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });
    app.use('/api/governance', governance_api_1.governanceRouter);
    const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: typeDefs_1.typeDefs, resolvers: resolvers_1.resolvers });
    const apollo = new server_1.ApolloServer({
        schema,
        csrfPrevention: false,
        introspection: env_1.envConfig.isDev,
        plugins: [
            env_1.envConfig.isDev
                ? (0, default_1.ApolloServerPluginLandingPageLocalDefault)({ includeCookies: true })
                : (0, default_1.ApolloServerPluginLandingPageProductionDefault)({ footer: false }),
        ],
    });
    await apollo.start();
    app.use('/graphql', (0, express5_1.expressMiddleware)(apollo, {
        context: async ({ req }) => (0, context_1.createContext)({ req: req }),
    }));
    const frontendDist = path_1.default.join(__dirname, '..', '..', 'frontend', 'dist');
    if (process.env.SERVE_FRONTEND === 'true' && fs_1.default.existsSync(frontendDist)) {
        app.use(express_1.default.static(frontendDist, {
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
            res.sendFile(path_1.default.join(frontendDist, 'index.html'));
        });
    }
    const httpServer = (0, http_1.createServer)(app);
    const shutdown = async (signal) => {
        console.info(`[Server] ${signal} received, shutting down...`);
        await apollo.stop();
        httpServer.close();
        await (0, context_1.disconnectPrisma)();
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
            await (0, seed_admin_1.seedAdminUser)(context_1.prisma);
        }
        catch (err) {
            console.error('[Server] Admin seed failed:', err);
        }
        // Initial sync: populate DB from governance files on startup
        console.info('[Server] Syncing governance artifacts from disk...');
        try {
            const result = await (0, sync_engine_1.syncArtifactsFromDisk)(context_1.prisma, env_1.envConfig.governanceRoot);
            console.info(`[Server] Sync complete: ${result.added} added, ${result.updated} updated, ${result.removed} deactivated`);
        }
        catch (err) {
            console.error('[Server] Sync failed:', err);
        }
        httpServer.listen(env_1.envConfig.port, env_1.envConfig.host, () => {
            const host = env_1.envConfig.host === '0.0.0.0' ? 'localhost' : env_1.envConfig.host;
            console.info(`Governance API ready at http://${host}:${env_1.envConfig.port}/graphql`);
            console.info(`REST API at http://${host}:${env_1.envConfig.port}/api/governance/health`);
        });
    });
}
//# sourceMappingURL=server.js.map