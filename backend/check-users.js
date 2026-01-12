const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SELECT * FROM "User"`;
  console.log('Users:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
