const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.update({
    where: { email: 'teacher@test.com' },
    data: { role: 'TEACHER' }
  });
  console.log('Updated:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
