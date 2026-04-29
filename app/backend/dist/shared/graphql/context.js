"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.createContext = createContext;
exports.disconnectPrisma = disconnectPrisma;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const env_1 = require("../../config/env");
const databaseUrl = env_1.envConfig.databaseUrl || 'postgresql://postgres:postgres@localhost:5433/governance?schema=public';
const pool = new pg_1.Pool({ connectionString: databaseUrl });
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = new client_1.PrismaClient({ adapter });
async function createContext(opts = {}) {
    const { verifyToken } = await Promise.resolve().then(() => __importStar(require('../auth/auth-helpers')));
    const ctx = { prisma: exports.prisma };
    if (env_1.envConfig.authBypass) {
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
async function disconnectPrisma() {
    await exports.prisma.$disconnect();
    await pool.end();
}
//# sourceMappingURL=context.js.map