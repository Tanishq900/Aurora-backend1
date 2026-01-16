import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

function readString(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

export const env = {
  isProduction,

  port(): number {
    const raw = readString('PORT');
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) ? parsed : 3001;
  },

  corsOrigins(): string[] {
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

  jwtAccessSecret(): string {
    const v = readString('JWT_ACCESS_SECRET');
    if (!v) throw new Error('Missing JWT_ACCESS_SECRET env');
    return v;
  },

  jwtRefreshSecret(): string {
    const v = readString('JWT_REFRESH_SECRET');
    if (!v) throw new Error('Missing JWT_REFRESH_SECRET env');
    return v;
  },

  jwtAccessExpiry(): string {
    return readString('JWT_ACCESS_EXPIRY') || '15m';
  },

  jwtRefreshExpiry(): string {
    return readString('JWT_REFRESH_EXPIRY') || '7d';
  },

  supabaseUrl(): string {
    const v = readString('SUPABASE_URL');
    if (!v) throw new Error('Missing SUPABASE_URL env');
    return v;
  },

  supabaseServiceRoleKey(): string {
    const v = readString('SUPABASE_SERVICE_ROLE') || readString('SUPABASE_SERVICE_KEY');
    if (!v) throw new Error('Missing SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_KEY) env');
    return v;
  },

  supabaseAnonKey(): string {
    const v = readString('SUPABASE_ANON_KEY') || readString('SUPABASE_KEY') || readString('SUPABASE_ANON');
    if (!v) throw new Error('Missing SUPABASE_ANON_KEY (or SUPABASE_KEY) env');
    return v;
  },

  supabaseStorageBucket(): string | undefined {
    return readString('SUPABASE_STORAGE_BUCKET') || readString('SUPABASE_STORAGE_BUCKET_NAME');
  },

  resendApiKey(): string | undefined {
    return readString('RESEND_API_KEY');
  },

  emailFrom(): string {
    return readString('EMAIL_FROM') || 'noreply@aurora-sentinel.com';
  },

  presentationModePassword(): string {
    const v = readString('PRESENTATION_MODE_PASSWORD');
    if (!v) {
      if (isProduction) throw new Error('Missing PRESENTATION_MODE_PASSWORD env');
      return 'demo123';
    }
    return v;
  },

  adminBootstrapEnabled(): boolean {
    const raw = readString('ADMIN_BOOTSTRAP_ENABLED');
    if (!raw) return !isProduction;
    return raw === 'true' || raw === '1';
  },

  adminEmail(): string {
    return readString('ADMIN_EMAIL') || 'admin@test.com';
  },

  adminPassword(): string {
    return readString('ADMIN_PASSWORD') || 'admin123';
  },
};
