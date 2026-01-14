import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  // Admin kullanıcı oluştur
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edupremium.com' },
    update: {},
    create: {
      email: 'admin@edupremium.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
    },
  });
  console.log('Admin:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
