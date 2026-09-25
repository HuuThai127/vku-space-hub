import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

/**
 * Validates whether real Supabase configuration is present.
 * Ensures the app does not crash or throw unhandled exceptions
 * when credentials are not yet configured or placeholder values are present.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  if (
    supabaseUrl.includes('your-project') ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.startsWith('<') ||
    supabaseAnonKey.startsWith('<') ||
    supabaseAnonKey === ''
  ) {
    return false;
  }
  return true;
}

// Fallback to safe dummy URL/key if not configured to prevent client instantiation crashes during build/test
const effectiveUrl = isSupabaseConfigured() ? supabaseUrl! : 'https://vku-spacehub.supabase.co';
const effectiveKey = isSupabaseConfigured() ? supabaseAnonKey! : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
