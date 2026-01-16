export declare const env: {
    isProduction: boolean;
    port(): number;
    corsOrigins(): string[];
    jwtAccessSecret(): string;
    jwtRefreshSecret(): string;
    jwtAccessExpiry(): string;
    jwtRefreshExpiry(): string;
    supabaseUrl(): string;
    supabaseServiceRoleKey(): string;
    supabaseAnonKey(): string;
    supabaseStorageBucket(): string | undefined;
    resendApiKey(): string | undefined;
    emailFrom(): string;
    presentationModePassword(): string;
    adminBootstrapEnabled(): boolean;
    adminEmail(): string;
    adminPassword(): string;
};
//# sourceMappingURL=env.d.ts.map