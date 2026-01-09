"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'InternalServerError';
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object') {
                const res = exceptionResponse;
                message = res.message || exception.message;
                error = res.error || exception.name;
                details = res.details;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const prismaError = this.handlePrismaError(exception);
            status = prismaError.status;
            message = prismaError.message;
            error = 'DatabaseError';
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = 'Invalid data provided';
            error = 'ValidationError';
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }
        const logMessage = `${request.method} ${request.url} - ${status} - ${message}`;
        if (status >= 500) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : '');
        }
        else if (status >= 400) {
            this.logger.warn(logMessage);
        }
        const errorResponse = {
            success: false,
            statusCode: status,
            message: Array.isArray(message) ? message[0] : message,
            error,
            details: Array.isArray(message) ? message : details,
            path: request.url,
            timestamp: new Date().toISOString(),
        };
        response.status(status).json(errorResponse);
    }
    handlePrismaError(error) {
        switch (error.code) {
            case 'P2002':
                const field = error.meta?.target?.join(', ') || 'field';
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: `A record with this ${field} already exists`,
                };
            case 'P2003':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Related record not found',
                };
            case 'P2025':
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: 'Record not found',
                };
            case 'P2014':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Required relation missing',
                };
            default:
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database error occurred',
                };
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map