export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

type SupabaseEnvironment = {
  [key: string]: string | undefined;
  GENPHD_ALLOW_DEMO_MODE?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
};

export function isSupabaseConfigured(environment: SupabaseEnvironment = process.env) {
  return Boolean(environment.NEXT_PUBLIC_SUPABASE_URL && environment.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isTurnstileConfigured(environment: SupabaseEnvironment = process.env) {
  return Boolean(environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function isDemoModeEnabled(environment: SupabaseEnvironment = process.env) {
  return environment.GENPHD_ALLOW_DEMO_MODE === "true";
}

export function getSupabaseConfig(environment: SupabaseEnvironment = process.env): SupabaseConfig {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return { url, anonKey };
}
