import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

/**
 * Supabase client with service_role key
 * CRITICAL: This should NEVER be exposed to the client
 * Only use on the backend API
 */
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
