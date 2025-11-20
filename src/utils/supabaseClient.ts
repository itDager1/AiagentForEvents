import { createClient } from '@supabase/supabase-js@2';
import { projectId, publicAnonKey } from './supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false, // Disabled persistence to prevent startup fetch errors in restricted environment
    detectSessionInUrl: false
  }
});
