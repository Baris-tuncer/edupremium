import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ApproveTeacherDto {
  @IsBoolean()
  isApproved: boolean;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
