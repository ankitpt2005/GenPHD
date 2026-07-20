export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export type PublicRuntimeConfig = {
  supabasePublishableKey?: string;
  supabaseUrl?: string;
  turnstileSiteKey?: string;
};

type SupabaseEnvironment = {
  [key: string]: string | undefined;
  GENPHD_ALLOW_DEMO_MODE?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
};

function getPublicSupabaseKey(environment: SupabaseEnvironment) {
  return environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getPublicRuntimeConfig(environment: SupabaseEnvironment = process.env): PublicRuntimeConfig {
  return {
    supabasePublishableKey: getPublicSupabaseKey(environment),
    supabaseUrl: environment.NEXT_PUBLIC_SUPABASE_URL,
    turnstileSiteKey: environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  };
}

export function isSupabaseConfigured(environment: SupabaseEnvironment = process.env) {
  return Boolean(environment.NEXT_PUBLIC_SUPABASE_URL && getPublicSupabaseKey(environment));
}

export function isTurnstileConfigured(environment: SupabaseEnvironment = process.env) {
  return Boolean(environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function isDemoModeEnabled(environment: SupabaseEnvironment = process.env) {
  return environment.GENPHD_ALLOW_DEMO_MODE === "true";
}

export function getSupabaseConfig(environment: SupabaseEnvironment = process.env): SupabaseConfig {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = getPublicSupabaseKey(environment);

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return { url, anonKey };
}
