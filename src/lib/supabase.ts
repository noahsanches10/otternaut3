import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl.startsWith('https://') || !supabaseKey) {
  console.error('Invalid or missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);