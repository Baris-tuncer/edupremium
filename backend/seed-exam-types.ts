import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedExamTypes() {
  const examTypes = [
    { name: 'LGS - Liseye Geçiş Sınavı', code: 'LGS' },
    { name: 'TYT - Temel Yeterlilik Testi', code: 'TYT' },
    { name: 'AYT - Alan Yeterlilik Testi', code: 'AYT' },
    { name: 'YDS - Yabancı Dil Sınavı', code: 'YDS' },
  ];

  for (const examType of examTypes) {
    await prisma.examType.upsert({
      where: { code: examType.code },
      update: {},
      create: examType,
    });
  }

  console.log('✅ ExamTypes seeded successfully!');
}

seedExamTypes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
