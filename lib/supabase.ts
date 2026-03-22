import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let browserClient: SupabaseClient | null = null;

function isPlaceholderValue(value: string | undefined) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    normalized === "your_url" ||
    normalized === "your_anon_key" ||
    normalized === "your_service_key" ||
    normalized === "placeholder"
  );
}

function getRequiredEnv(value: string | undefined, name: string): string {
  if (isPlaceholderValue(value)) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value as string;
}

export function isSupabaseConfigured() {
  return !(
    isPlaceholderValue(supabaseUrl) ||
    isPlaceholderValue(supabaseAnonKey) ||
    isPlaceholderValue(supabaseServiceRoleKey)
  );
}

export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createClient(
    getRequiredEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );

  return browserClient;
}

export function createServerSupabaseClient() {
  return createClient(
    getRequiredEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv(supabaseServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
