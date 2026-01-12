import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('admin')
export class MakeTeacherController {
  constructor(private prisma: PrismaService) {}

  @Post('make-teacher')
  async makeTeacher(@Body() body: { email: string; secret: string }) {
    if (body.secret !== 'edupremium2024secret') {
      return { error: 'Invalid secret' };
    }
    
    // Get or create default branch
    let branch = await this.prisma.branch.findFirst();
    if (!branch) {
      branch = await this.prisma.branch.create({
        data: { name: 'Genel', description: 'Varsayılan branş' }
      });
    }

    const user = await this.prisma.user.update({
      where: { email: body.email },
      data: { role: 'TEACHER' }
    });

    const existing = await this.prisma.teacher.findUnique({
      where: { userId: user.id }
    });

    if (!existing) {
      await this.prisma.teacher.create({
        data: {
          user: { connect: { id: user.id } },
          branch: { connect: { id: branch.id } },
          firstName: user.firstName,
          lastName: user.lastName,
          hourlyRate: 200
        }
      });
    }

    return { success: true, user: { email: user.email, role: user.role } };
  }
}
