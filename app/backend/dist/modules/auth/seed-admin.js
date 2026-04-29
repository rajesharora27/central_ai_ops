"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = seedAdminUser;
const auth_helpers_1 = require("../../shared/auth/auth-helpers");
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'AIOPS123!!';
async function seedAdminUser(prisma) {
    const existing = await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } });
    if (existing)
        return;
    const passwordHash = await (0, auth_helpers_1.hashPassword)(ADMIN_PASSWORD);
    await prisma.user.create({
        data: {
            username: ADMIN_USERNAME,
            passwordHash,
            isAdmin: true,
        },
    });
    console.info('[Server] Admin user created (username: admin)');
}
//# sourceMappingURL=seed-admin.js.map