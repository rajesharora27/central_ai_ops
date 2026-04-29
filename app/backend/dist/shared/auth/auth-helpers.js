"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.requireUser = requireUser;
exports.requireAdmin = requireAdmin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.envConfig.jwtSecret, {
        expiresIn: env_1.envConfig.jwtExpiresIn,
    });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.envConfig.jwtSecret);
    }
    catch {
        return null;
    }
}
function requireUser(ctx) {
    if (env_1.envConfig.authBypass)
        return 'bypass-user';
    if (!ctx.userId)
        throw new Error('Authentication required');
    return ctx.userId;
}
function requireAdmin(ctx) {
    if (env_1.envConfig.authBypass)
        return 'bypass-admin';
    if (!ctx.userId)
        throw new Error('Authentication required');
    if (!ctx.isAdmin)
        throw new Error('Admin access required');
    return ctx.userId;
}
//# sourceMappingURL=auth-helpers.js.map