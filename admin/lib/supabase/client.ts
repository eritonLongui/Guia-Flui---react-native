import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';

export function createClient() {
  return createBrowserClient(supabaseUrl() || 'https://placeholder.supabase.co', supabaseAnonKey() || 'public-anon-placeholder');
}
