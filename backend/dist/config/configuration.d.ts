declare const _default: () => {
    port: number;
    nodeEnv: string;
    database: {
        url: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    iyzico: {
        apiKey: string;
        secretKey: string;
        baseUrl: string;
    };
    microsoft: {
        tenantId: string;
        clientId: string;
        clientSecret: string;
        systemUserId: string;
    };
    anthropic: {
        apiKey: string;
        model: string;
    };
    email: {
        apiKey: string;
        from: string;
        fromName: string;
    };
    sms: {
        userCode: string;
        password: string;
        header: string;
    };
    platform: {
        name: string;
        url: string;
        commissionRate: number;
        bankTransferDeadlineHours: number;
        iban: string;
        bankName: string;
    };
    cors: {
        origin: string;
    };
};
export default _default;
