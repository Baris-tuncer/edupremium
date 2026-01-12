const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'ogretmen@test.com' },
    data: { role: 'TEACHER' }
  });
  console.log('Updated:', user);
  
  // Teacher kaydı oluştur
  await prisma.teacher.create({
    data: {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      hourlyRate: 200
    }
  });
  console.log('Teacher record created');
}

main().catch(console.error).finally(() => prisma.$disconnect());
