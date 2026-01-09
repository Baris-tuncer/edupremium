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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipGuard = exports.CheckOwnership = exports.OWNERSHIP_KEY = exports.ApprovedTeacherGuard = exports.RolesGuard = exports.JwtAuthGuard = exports.CurrentUser = exports.Public = exports.IS_PUBLIC_KEY = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../../prisma/prisma.module");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService, configService, prisma, reflector) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(exports.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Access token required');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    deletedAt: true,
                },
            });
            if (!user || user.deletedAt || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            request.user = {
                id: user.id,
                email: user.email,
                role: user.role,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        return true;
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_module_1.PrismaService,
        core_1.Reflector])
], JwtAuthGuard);
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(exports.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const hasRole = requiredRoles.some((role) => user.role === role);
        if (!hasRole) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
let ApprovedTeacherGuard = class ApprovedTeacherGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user.role !== 'TEACHER') {
            throw new common_1.ForbiddenException('Teacher access required');
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId: user.id },
            select: { isApproved: true },
        });
        if (!teacher || !teacher.isApproved) {
            throw new common_1.ForbiddenException('Teacher account not approved');
        }
        return true;
    }
};
exports.ApprovedTeacherGuard = ApprovedTeacherGuard;
exports.ApprovedTeacherGuard = ApprovedTeacherGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], ApprovedTeacherGuard);
exports.OWNERSHIP_KEY = 'ownership';
const CheckOwnership = (resourceType, userIdField = 'userId') => (0, common_1.SetMetadata)(exports.OWNERSHIP_KEY, { resourceType, userIdField });
exports.CheckOwnership = CheckOwnership;
let OwnershipGuard = class OwnershipGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const ownershipConfig = this.reflector.get(exports.OWNERSHIP_KEY, context.getHandler());
        if (!ownershipConfig) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const resourceId = request.params.id;
        if (user.role === 'ADMIN') {
            return true;
        }
        const resource = await this.prisma[ownershipConfig.resourceType].findUnique({
            where: { id: resourceId },
            select: { [ownershipConfig.userIdField]: true },
        });
        if (!resource) {
            throw new common_1.ForbiddenException('Resource not found');
        }
        if (resource[ownershipConfig.userIdField] !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this resource');
        }
        return true;
    }
};
exports.OwnershipGuard = OwnershipGuard;
exports.OwnershipGuard = OwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_module_1.PrismaService])
], OwnershipGuard);
//# sourceMappingURL=auth.guard.js.map