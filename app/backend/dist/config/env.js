"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.envConfig = {
    port: parseInt(process.env.PORT || '4100', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV !== 'production',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    governanceRoot: path_1.default.resolve(process.cwd(), process.env.GOVERNANCE_ROOT || '../../global'),
    databaseUrl: process.env.DATABASE_URL || '',
    authBypass: process.env.AUTH_BYPASS === 'true',
    corsOrigin: process.env.CORS_ORIGIN || '*',
};
//# sourceMappingURL=env.js.map