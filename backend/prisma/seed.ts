import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Branch oluştur
  const branch = await prisma.branch.upsert({
    where: { name: 'Matematik' },
    update: {},
    create: {
      name: 'Matematik',
    },
  });
  console.log('Branch:', branch.name, '- ID:', branch.id);

  // Davet kodu oluştur
  const invitation = await prisma.invitationCode.create({
    data: {
      code: 'TEST123',
      status: 'ACTIVE',
      expiresAt: new Date('2027-12-31'),
    },
  });
  console.log('Davet kodu:', invitation.code);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
