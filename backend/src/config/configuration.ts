// ============================================================================
// CONFIGURATION
// ============================================================================

export default () => ({
  // App
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  
  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Iyzico
  iyzico: {
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  },
  
  // Microsoft Graph
  microsoft: {
    tenantId: process.env.MS_TENANT_ID,
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
    systemUserId: process.env.MS_SYSTEM_USER_ID, // For creating meetings
  },
  
  // Anthropic (Claude AI)
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.AI_MODEL || 'claude-3-opus-20240229',
  },
  
  // Email (SendGrid)
  email: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@platform.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Premium EdTech Platform',
  },
  
  // SMS (NetGSM)
  sms: {
    userCode: process.env.NETGSM_USER_CODE,
    password: process.env.NETGSM_PASSWORD,
    header: process.env.NETGSM_HEADER,
  },
  
  // Platform Settings
  platform: {
    name: 'Premium EdTech Platform',
    url: process.env.PLATFORM_URL || 'http://localhost:3000',
    commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 20,
    bankTransferDeadlineHours: parseInt(process.env.BANK_TRANSFER_DEADLINE_HOURS, 10) || 24,
    iban: process.env.PLATFORM_IBAN,
    bankName: process.env.PLATFORM_BANK_NAME,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
});
