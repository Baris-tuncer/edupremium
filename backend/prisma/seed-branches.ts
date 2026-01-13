import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const branches = [
    { name: 'İlkokul', subjects: ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İngilizce', 'Sosyal Bilgiler'] },
    { name: 'Ortaokul', subjects: ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İngilizce', 'Sosyal Bilgiler'] },
    { name: 'Lise', subjects: ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe'] },
    { name: 'Sınav Hazırlık', subjects: ['LGS Hazırlık', 'TYT Hazırlık', 'AYT Hazırlık'] },
    { name: 'Yabancı Dil', subjects: ['İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'TOEFL Hazırlık', 'IELTS Hazırlık'] },
  ];

  for (const branch of branches) {
    let b = await prisma.branch.findFirst({ where: { name: branch.name } });
    if (!b) {
      b = await prisma.branch.create({ data: { name: branch.name } });
      console.log('Created branch:', branch.name);
    }
    for (const subj of branch.subjects) {
      const exists = await prisma.subject.findFirst({ where: { name: subj, branchId: b.id } });
      if (!exists) {
        await prisma.subject.create({ data: { name: subj, branchId: b.id } });
        console.log('  Added subject:', subj);
      }
    }
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
