import { PaymentMethod, AppointmentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/common.dto';
export declare class CreateAppointmentDto {
    teacherId: string;
    subjectId: string;
    scheduledAt: string;
    durationMinutes?: number;
    paymentMethod: PaymentMethod;
    studentNote?: string;
}
export declare class AppointmentResponseDto {
    id: string;
    orderCode: string;
    teacherName: string;
    teacherPhoto?: string;
    subjectName: string;
    scheduledAt: string;
    durationMinutes: number;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    paymentAmount: number;
    status: AppointmentStatus;
    teamsJoinUrl?: string;
    studentNote?: string;
    bankTransferDeadline?: string;
}
export declare class AppointmentListQueryDto extends PaginationDto {
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
}
export declare class BankTransferInfoDto {
    orderCode: string;
    amount: number;
    bankName: string;
    iban: string;
    accountHolder: string;
    deadline: string;
    instructions: string;
}
export declare class UploadReceiptDto {
    receiptUrl: string;
}
export declare class MarkNoShowDto {
    notes?: string;
}
export declare class CancelAppointmentDto {
    reason?: string;
}
export declare class TeacherAvailabilitySlotDto {
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}
export declare class GetAvailabilityQueryDto {
    teacherId: string;
    startDate: string;
    endDate: string;
}
