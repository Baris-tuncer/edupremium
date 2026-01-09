"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appointments_service_1 = require("./appointments.service");
const appointments_dto_1 = require("./dto/appointments.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const client_1 = require("@prisma/client");
let AppointmentsController = class AppointmentsController {
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    async create(userId, dto) {
        return this.appointmentsService.createAppointment(userId, dto);
    }
    async list(userId, userRole, query) {
        return this.appointmentsService.listAppointments(userId, userRole, query);
    }
    async getById(id, userId, userRole) {
        return this.appointmentsService.getAppointmentById(id, userId, userRole);
    }
    async cancel(id, userId, dto) {
        return this.appointmentsService.cancelAppointment(id, userId, dto.reason);
    }
    async startLesson(id, userId) {
        return this.appointmentsService.markLessonStarted(id, userId);
    }
    async markNoShow(id, userId, dto) {
        return this.appointmentsService.markNoShow(id, userId, dto);
    }
    async uploadReceipt(id, userId, dto) {
        return { message: 'Receipt uploaded successfully. Awaiting admin approval.' };
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, auth_guard_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new appointment' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: appointments_dto_1.AppointmentResponseDto }),
    __param(0, (0, auth_guard_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, appointments_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List appointments (filtered by user role)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, auth_guard_1.CurrentUser)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('role')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, appointments_dto_1.AppointmentListQueryDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get appointment details' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: appointments_dto_1.AppointmentResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('id')),
    __param(2, (0, auth_guard_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an appointment' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: appointments_dto_1.AppointmentResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, appointments_dto_1.CancelAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, auth_guard_1.Roles)(client_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark lesson as started' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: appointments_dto_1.AppointmentResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "startLesson", null);
__decorate([
    (0, common_1.Post)(':id/no-show'),
    (0, auth_guard_1.Roles)(client_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark student as no-show' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: appointments_dto_1.AppointmentResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, appointments_dto_1.MarkNoShowDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "markNoShow", null);
__decorate([
    (0, common_1.Post)(':id/upload-receipt'),
    (0, auth_guard_1.Roles)(client_1.UserRole.STUDENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Upload bank transfer receipt' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, appointments_dto_1.UploadReceiptDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "uploadReceipt", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, swagger_1.ApiTags)('Appointments'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.RolesGuard),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map