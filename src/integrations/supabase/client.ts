import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bsogscaipffwkjszicfc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QCchqO2a6tLD_xcs3CTQdw_7CB3M8HS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
