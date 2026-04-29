import { GraphQLContext } from '../../shared/graphql/context';
import {
  comparePassword,
  signToken,
} from '../../shared/auth/auth-helpers';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.userId) return null;
      return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
    },
  },

  Mutation: {
    login: async (
      _: unknown,
      args: { username: string; password: string },
      ctx: GraphQLContext
    ) => {
      const user = await ctx.prisma.user.findUnique({
        where: { username: args.username },
      });
      if (!user) throw new Error('Invalid credentials');

      const valid = await comparePassword(args.password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials');

      const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
      return { token, user };
    },
  },
};
