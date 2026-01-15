// ============================================================================
// AUTH GUARDS & DECORATORS
// ============================================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';

// ============================================
// DECORATORS
// ============================================

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// ============================================
// JWT AUTH GUARD
// ============================================

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Check if user still exists and is active
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
        throw new UnauthorizedException('User not found or inactive');
      }

      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// ============================================
// ROLES GUARD
// ============================================

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// ============================================
// TEACHER GUARD (Active teacher check)
// ============================================

@Injectable()
export class TeacherGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role !== 'TEACHER') {
      throw new ForbiddenException('Teacher access required');
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!teacher) {
      throw new ForbiddenException('Teacher account not found');
    }

    return true;
  }
}

// ============================================
// OWNERSHIP GUARD (Generic)
// ============================================

export const OWNERSHIP_KEY = 'ownership';
export const CheckOwnership = (resourceType: string, userIdField = 'userId') =>
  SetMetadata(OWNERSHIP_KEY, { resourceType, userIdField });

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownershipConfig = this.reflector.get<{
      resourceType: string;
      userIdField: string;
    }>(OWNERSHIP_KEY, context.getHandler());

    if (!ownershipConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    // Admins bypass ownership check
    if (user.role === 'ADMIN') {
      return true;
    }

    const resource = await this.prisma[ownershipConfig.resourceType].findUnique({
      where: { id: resourceId },
      select: { [ownershipConfig.userIdField]: true },
    });

    if (!resource) {
      throw new ForbiddenException('Resource not found');
    }

    if (resource[ownershipConfig.userIdField] !== user.id) {
      throw new ForbiddenException('Access denied to this resource');
    }

    return true;
  }
}
