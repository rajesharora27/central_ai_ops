import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../shared/auth/auth-helpers';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'AIOPS123!!';

export async function seedAdminUser(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } });
  if (existing) return;

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      passwordHash,
      isAdmin: true,
    },
  });
  console.info('[Server] Admin user created (username: admin)');
}
