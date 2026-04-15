import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing");
}

/**
 * Custom storage adapter for Supabase Auth.
 * On native platforms (Android/iOS) uses Capacitor Preferences
 * (backed by SharedPreferences / NSUserDefaults) which is more
 * reliable than localStorage inside a WebView.
 * On web, falls back to localStorage for simplicity.
 */
const capacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string): Promise<void> => {
    await Preferences.remove({ key });
  },
};

const isNative = Capacitor.isNativePlatform();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !isNative,
    ...(isNative
      ? {
          storage: capacitorStorage,
          lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
        }
      : {}),
  },
});
