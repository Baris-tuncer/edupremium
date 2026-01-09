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
exports.SimpleCacheInterceptor = exports.TimeoutInterceptor = exports.LoggingInterceptor = exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => ({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        })));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip } = request;
        const userAgent = request.get('user-agent') || '';
        const userId = request.user?.id || 'anonymous';
        const now = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;
                const contentLength = response.get('content-length') || 0;
                const duration = Date.now() - now;
                this.logger.log(`${method} ${url} ${statusCode} ${contentLength}B ${duration}ms - ${userId} - ${ip} - ${userAgent}`);
            },
            error: (error) => {
                const duration = Date.now() - now;
                this.logger.error(`${method} ${url} ERROR ${duration}ms - ${userId} - ${ip} - ${error.message}`);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
const operators_2 = require("rxjs/operators");
const rxjs_2 = require("rxjs");
const common_2 = require("@nestjs/common");
let TimeoutInterceptor = class TimeoutInterceptor {
    constructor(timeoutMs = 30000) {
        this.timeoutMs = timeoutMs;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_2.timeout)(this.timeoutMs), (0, operators_2.catchError)((err) => {
            if (err instanceof rxjs_2.TimeoutError) {
                return (0, rxjs_2.throwError)(() => new common_2.RequestTimeoutException('Request timeout'));
            }
            return (0, rxjs_2.throwError)(() => err);
        }));
    }
};
exports.TimeoutInterceptor = TimeoutInterceptor;
exports.TimeoutInterceptor = TimeoutInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Number])
], TimeoutInterceptor);
let SimpleCacheInterceptor = class SimpleCacheInterceptor {
    constructor(ttlSeconds = 60) {
        this.cache = new Map();
        this.ttlMs = ttlSeconds * 1000;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (request.method !== 'GET') {
            return next.handle();
        }
        const key = `${request.url}`;
        const cached = this.cache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return new rxjs_1.Observable((subscriber) => {
                subscriber.next(cached.data);
                subscriber.complete();
            });
        }
        return next.handle().pipe((0, operators_1.tap)((data) => {
            this.cache.set(key, {
                data,
                expiry: Date.now() + this.ttlMs,
            });
        }));
    }
};
exports.SimpleCacheInterceptor = SimpleCacheInterceptor;
exports.SimpleCacheInterceptor = SimpleCacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Number])
], SimpleCacheInterceptor);
//# sourceMappingURL=transform.interceptor.js.map