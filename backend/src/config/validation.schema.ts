// ============================================================================
// ENVIRONMENT VALIDATION SCHEMA
// ============================================================================

import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().default(4000),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  
  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  
  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  
  // Iyzico
  IYZICO_API_KEY: Joi.string().required(),
  IYZICO_SECRET_KEY: Joi.string().required(),
  IYZICO_BASE_URL: Joi.string().uri().default('https://sandbox-api.iyzipay.com'),
  
  // Microsoft Graph
  MS_TENANT_ID: Joi.string().required(),
  MS_CLIENT_ID: Joi.string().required(),
  MS_CLIENT_SECRET: Joi.string().required(),
  MS_SYSTEM_USER_ID: Joi.string().required(),
  
  // Anthropic
  ANTHROPIC_API_KEY: Joi.string().required(),
  AI_MODEL: Joi.string().default('claude-3-opus-20240229'),
  
  // Email
  SENDGRID_API_KEY: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().default('noreply@platform.com'),
  EMAIL_FROM_NAME: Joi.string().default('Premium EdTech Platform'),
  
  // SMS
  NETGSM_USER_CODE: Joi.string().required(),
  NETGSM_PASSWORD: Joi.string().required(),
  NETGSM_HEADER: Joi.string().required(),
  
  // Platform
  PLATFORM_URL: Joi.string().uri().default('http://localhost:3000'),
  PLATFORM_COMMISSION_RATE: Joi.number().min(0).max(100).default(20),
  BANK_TRANSFER_DEADLINE_HOURS: Joi.number().min(1).max(72).default(24),
  PLATFORM_IBAN: Joi.string().required(),
  PLATFORM_BANK_NAME: Joi.string().required(),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
});
