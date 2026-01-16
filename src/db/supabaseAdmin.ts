import { createClient } from '@supabase/supabase-js';

import { env } from '../config/env';

const supabaseUrl = env.supabaseUrl();
const supabaseServiceKey = env.supabaseServiceRoleKey();

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
