"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'staging', 'production')
        .default('development'),
    PORT: Joi.number().default(4000),
    DATABASE_URL: Joi.string().required(),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').optional(),
    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    IYZICO_API_KEY: Joi.string().required(),
    IYZICO_SECRET_KEY: Joi.string().required(),
    IYZICO_BASE_URL: Joi.string().uri().default('https://sandbox-api.iyzipay.com'),
    MS_TENANT_ID: Joi.string().required(),
    MS_CLIENT_ID: Joi.string().required(),
    MS_CLIENT_SECRET: Joi.string().required(),
    MS_SYSTEM_USER_ID: Joi.string().required(),
    ANTHROPIC_API_KEY: Joi.string().required(),
    AI_MODEL: Joi.string().default('claude-3-opus-20240229'),
    SENDGRID_API_KEY: Joi.string().required(),
    EMAIL_FROM: Joi.string().email().default('noreply@platform.com'),
    EMAIL_FROM_NAME: Joi.string().default('Premium EdTech Platform'),
    NETGSM_USER_CODE: Joi.string().required(),
    NETGSM_PASSWORD: Joi.string().required(),
    NETGSM_HEADER: Joi.string().required(),
    PLATFORM_URL: Joi.string().uri().default('http://localhost:3000'),
    PLATFORM_COMMISSION_RATE: Joi.number().min(0).max(100).default(20),
    BANK_TRANSFER_DEADLINE_HOURS: Joi.number().min(1).max(72).default(24),
    PLATFORM_IBAN: Joi.string().required(),
    PLATFORM_BANK_NAME: Joi.string().required(),
    CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
});
//# sourceMappingURL=validation.schema.js.map