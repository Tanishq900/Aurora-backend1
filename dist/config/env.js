"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
function readString(key) {
    const v = process.env[key];
    if (typeof v !== 'string')
        return undefined;
    const t = v.trim();
    return t ? t : undefined;
}
exports.env = {
    isProduction,
    port() {
        const raw = readString('PORT');
        const parsed = raw ? Number.parseInt(raw, 10) : NaN;
        return Number.isFinite(parsed) ? parsed : 3001;
    },
    corsOrigins() {
        const raw = readString('CORS_ORIGINS') || readString('CORS_ORIGIN');
        if (!raw) {
            if (isProduction) {
                throw new Error('Missing CORS_ORIGINS (or CORS_ORIGIN) env');
            }
            return ['http://localhost:3000'];
        }
        return raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    },
    jwtAccessSecret() {
        const v = readString('JWT_ACCESS_SECRET');
        if (!v)
            throw new Error('Missing JWT_ACCESS_SECRET env');
        return v;
    },
    jwtRefreshSecret() {
        const v = readString('JWT_REFRESH_SECRET');
        if (!v)
            throw new Error('Missing JWT_REFRESH_SECRET env');
        return v;
    },
    jwtAccessExpiry() {
        return readString('JWT_ACCESS_EXPIRY') || '15m';
    },
    jwtRefreshExpiry() {
        return readString('JWT_REFRESH_EXPIRY') || '7d';
    },
    supabaseUrl() {
        const v = readString('SUPABASE_URL');
        if (!v)
            throw new Error('Missing SUPABASE_URL env');
        return v;
    },
    supabaseServiceRoleKey() {
        const v = readString('SUPABASE_SERVICE_ROLE') || readString('SUPABASE_SERVICE_KEY');
        if (!v)
            throw new Error('Missing SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_KEY) env');
        return v;
    },
    supabaseAnonKey() {
        const v = readString('SUPABASE_ANON_KEY') || readString('SUPABASE_KEY') || readString('SUPABASE_ANON');
        if (!v)
            throw new Error('Missing SUPABASE_ANON_KEY (or SUPABASE_KEY) env');
        return v;
    },
    supabaseStorageBucket() {
        return readString('SUPABASE_STORAGE_BUCKET') || readString('SUPABASE_STORAGE_BUCKET_NAME');
    },
    resendApiKey() {
        return readString('RESEND_API_KEY');
    },
    emailFrom() {
        return readString('EMAIL_FROM') || 'noreply@aurora-sentinel.com';
    },
    presentationModePassword() {
        const v = readString('PRESENTATION_MODE_PASSWORD');
        if (!v) {
            if (isProduction)
                throw new Error('Missing PRESENTATION_MODE_PASSWORD env');
            return 'demo123';
        }
        return v;
    },
    adminBootstrapEnabled() {
        const raw = readString('ADMIN_BOOTSTRAP_ENABLED');
        if (!raw)
            return !isProduction;
        return raw === 'true' || raw === '1';
    },
    adminEmail() {
        return readString('ADMIN_EMAIL') || 'admin@test.com';
    },
    adminPassword() {
        return readString('ADMIN_PASSWORD') || 'admin123';
    },
};
//# sourceMappingURL=env.js.map