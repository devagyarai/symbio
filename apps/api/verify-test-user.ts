import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'symbiouat2026@gmail.com';
  console.log(`Verifying email for ${email}...`);
  
  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() }
  });
  
  console.log(`Successfully verified email for user ID: ${user.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
