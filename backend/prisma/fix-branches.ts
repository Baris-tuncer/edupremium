import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mathBranch = await prisma.branch.findFirst({ where: { name: 'Matematik' } });
  const liseBranch = await prisma.branch.findFirst({ where: { name: 'Lise' } });
  
  if (mathBranch && liseBranch) {
    await prisma.teacher.updateMany({ where: { branchId: mathBranch.id }, data: { branchId: liseBranch.id } });
    console.log('Moved teachers to Lise');
    await prisma.subject.deleteMany({ where: { branchId: mathBranch.id } });
    await prisma.branch.delete({ where: { id: mathBranch.id } });
    console.log('Deleted Matematik branch');
  }

  const ortaokul = await prisma.branch.findFirst({ where: { name: 'Ortaokul' } });
  if (ortaokul) {
    const exists = await prisma.subject.findFirst({ where: { name: 'Din Kulturu ve Ahlak Bilgisi', branchId: ortaokul.id } });
    if (!exists) {
      await prisma.subject.create({ data: { name: 'Din Kulturu ve Ahlak Bilgisi', branchId: ortaokul.id } });
      console.log('Added Din Kulturu to Ortaokul');
    }
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
