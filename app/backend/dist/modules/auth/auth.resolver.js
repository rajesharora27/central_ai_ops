"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResolvers = void 0;
const auth_helpers_1 = require("../../shared/auth/auth-helpers");
exports.authResolvers = {
    Query: {
        me: async (_, __, ctx) => {
            if (!ctx.userId)
                return null;
            return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
        },
    },
    Mutation: {
        login: async (_, args, ctx) => {
            const user = await ctx.prisma.user.findUnique({
                where: { username: args.username },
            });
            if (!user)
                throw new Error('Invalid credentials');
            const valid = await (0, auth_helpers_1.comparePassword)(args.password, user.passwordHash);
            if (!valid)
                throw new Error('Invalid credentials');
            const token = (0, auth_helpers_1.signToken)({ userId: user.id, isAdmin: user.isAdmin });
            return { token, user };
        },
    },
};
//# sourceMappingURL=auth.resolver.js.map