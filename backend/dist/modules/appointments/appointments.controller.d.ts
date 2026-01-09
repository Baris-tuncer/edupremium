import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, AppointmentResponseDto, AppointmentListQueryDto, CancelAppointmentDto, MarkNoShowDto, UploadReceiptDto } from './dto/appointments.dto';
import { PaginatedResponseDto } from '../../common/dto/common.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(userId: string, dto: CreateAppointmentDto): Promise<AppointmentResponseDto>;
    list(userId: string, userRole: string, query: AppointmentListQueryDto): Promise<PaginatedResponseDto<AppointmentResponseDto>>;
    getById(id: string, userId: string, userRole: string): Promise<AppointmentResponseDto>;
    cancel(id: string, userId: string, dto: CancelAppointmentDto): Promise<AppointmentResponseDto>;
    startLesson(id: string, userId: string): Promise<AppointmentResponseDto>;
    markNoShow(id: string, userId: string, dto: MarkNoShowDto): Promise<AppointmentResponseDto>;
    uploadReceipt(id: string, userId: string, dto: UploadReceiptDto): Promise<{
        message: string;
    }>;
}
