"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
const supabaseUrl = env_1.env.supabaseUrl();
const supabaseServiceKey = env_1.env.supabaseServiceRoleKey();
const supabaseAnonKey = env_1.env.supabaseAnonKey();
// Service client for admin operations (bypasses RLS)
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// Anon client for client-side operations
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
// Note: Direct SQL queries should use Supabase client methods
// The Supabase client handles all database operations
//# sourceMappingURL=client.js.map