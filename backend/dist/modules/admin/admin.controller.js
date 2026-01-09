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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const invitations_service_1 = require("./invitations.service");
const finance_service_1 = require("./finance.service");
const auth_guard_1 = require("../../common/guards/auth.guard");
const client_1 = require("@prisma/client");
class CreateInvitationsDto {
}
class ApproveTeacherDto {
}
class RejectTeacherDto {
}
class ApproveBankTransferDto {
}
class RejectBankTransferDto {
}
class ProcessPayoutDto {
}
class BulkPayoutDto {
}
let AdminController = class AdminController {
    constructor(adminService, invitationsService, financeService) {
        this.adminService = adminService;
        this.invitationsService = invitationsService;
        this.financeService = financeService;
    }
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }
    async createInvitations(adminId, dto) {
        return this.invitationsService.createInvitations(adminId, dto);
    }
    async listInvitations(page = 1, limit = 20, status) {
        return this.invitationsService.listInvitations(page, limit, status);
    }
    async revokeInvitation(id) {
        return this.invitationsService.revokeInvitation(id);
    }
    async getPendingTeachers(page = 1, limit = 20) {
        return this.adminService.getPendingTeachers(page, limit);
    }
    async approveTeacher(teacherId, adminId) {
        return this.adminService.approveTeacher(teacherId, adminId);
    }
    async rejectTeacher(teacherId, dto) {
        return this.adminService.rejectTeacher(teacherId, dto.reason);
    }
    async getPendingBankTransfers() {
        return this.adminService.getDashboardStats().then((stats) => ({
            count: stats.finance.pendingBankTransfers,
        }));
    }
    async approveBankTransfer(appointmentId, adminId) {
        return this.adminService.approveBankTransfer(appointmentId, adminId);
    }
    async rejectBankTransfer(appointmentId, dto) {
        return this.adminService.rejectBankTransfer(appointmentId, dto.reason);
    }
    async getHakedisReport(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
        return this.financeService.getMonthlyHakedisReport(year, month);
    }
    async getPendingPayouts() {
        return this.financeService.getPendingPayouts();
    }
    async processPayout(adminId, dto) {
        return this.financeService.processPayout(dto.walletId, dto.amount, adminId, dto.reference);
    }
    async processBulkPayout(adminId, dto) {
        return this.financeService.processBulkPayout(dto.payouts, adminId, dto.batchReference);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('invitations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new invitation code(s)' }),
    __param(0, (0, auth_guard_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateInvitationsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createInvitations", null);
__decorate([
    (0, common_1.Get)('invitations'),
    (0, swagger_1.ApiOperation)({ summary: 'List all invitation codes' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listInvitations", null);
__decorate([
    (0, common_1.Delete)('invitations/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke an invitation code' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "revokeInvitation", null);
__decorate([
    (0, common_1.Get)('teachers/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending teacher applications' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingTeachers", null);
__decorate([
    (0, common_1.Post)('teachers/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a teacher application' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveTeacher", null);
__decorate([
    (0, common_1.Post)('teachers/:id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a teacher application' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectTeacherDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectTeacher", null);
__decorate([
    (0, common_1.Get)('payments/bank-transfers/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending bank transfer approvals' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingBankTransfers", null);
__decorate([
    (0, common_1.Post)('payments/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a bank transfer payment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_guard_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveBankTransfer", null);
__decorate([
    (0, common_1.Post)('payments/:id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a bank transfer payment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectBankTransferDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectBankTransfer", null);
__decorate([
    (0, common_1.Get)('finance/hakedis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get monthly hakediş report' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getHakedisReport", null);
__decorate([
    (0, common_1.Get)('finance/pending-payouts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of pending payouts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingPayouts", null);
__decorate([
    (0, common_1.Post)('finance/payout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process a single payout' }),
    __param(0, (0, auth_guard_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ProcessPayoutDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "processPayout", null);
__decorate([
    (0, common_1.Post)('finance/bulk-payout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process multiple payouts' }),
    __param(0, (0, auth_guard_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, BulkPayoutDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "processBulkPayout", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(auth_guard_1.RolesGuard),
    (0, auth_guard_1.Roles)(client_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        invitations_service_1.InvitationsService,
        finance_service_1.FinanceService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map