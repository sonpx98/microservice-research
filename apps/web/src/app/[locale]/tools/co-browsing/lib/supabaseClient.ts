
import { createClient } from '@supabase/supabase-js';

// TODO: Move these to .env.local for production
const SUPABASE_URL = process.env.NEXT_PUBLIC_COBROWSING_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_COBROWSING_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
