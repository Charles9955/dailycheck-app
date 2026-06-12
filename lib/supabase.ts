import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cloud sync is OPTIONAL. If these env vars aren't set, the app runs
// exactly as before — fully local, no account required.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Single row per user holds the entire app state as JSON.
export const APP_STATE_TABLE = "app_state";
