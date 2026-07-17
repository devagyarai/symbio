const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'symbiouat2026@gmail.com' },
    include: { workspaceMemberships: true }
  });
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, systemRole: user.systemRole },
    'ru9375f93yt9o4yti3ynityyrni87rct587o',
    { expiresIn: '1h' }
  );
  console.log('TOKEN:', token);
  console.log('WORKSPACE_ID:', user.workspaceMemberships[0].workspaceId);
}

main().finally(() => prisma.$disconnect());
