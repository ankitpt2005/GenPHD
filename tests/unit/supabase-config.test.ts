import { describe, expect, it } from "vitest";
import { getPublicRuntimeConfig, getSupabaseConfig, isDemoModeEnabled, isSupabaseConfigured, isTurnstileConfigured } from "../../lib/supabase/config";

describe("Supabase configuration", () => {
  it("requires a URL and accepts a publishable or legacy public key", () => {
    expect(isSupabaseConfigured({})).toBe(false);
    expect(isSupabaseConfigured({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })).toBe(false);
    expect(
      isSupabaseConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      }),
    ).toBe(true);
    expect(
      isSupabaseConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-anon-key",
      }),
    ).toBe(true);
  });

  it("returns only the public client configuration", () => {
    const config = getSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
    });

    expect(config).toEqual({ url: "https://example.supabase.co", anonKey: "publishable-key" });
    expect(() => getSupabaseConfig({})).toThrow("Supabase is not configured");
  });

  it("keeps demo mode and CAPTCHA configuration explicit", () => {
    expect(isDemoModeEnabled({})).toBe(false);
    expect(isDemoModeEnabled({ GENPHD_ALLOW_DEMO_MODE: "true" })).toBe(true);
    expect(isTurnstileConfigured({})).toBe(false);
    expect(isTurnstileConfigured({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key" })).toBe(true);
  });

  it("exposes only browser-safe runtime values", () => {
    expect(getPublicRuntimeConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
      SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
    })).toEqual({
      supabasePublishableKey: "publishable-key",
      supabaseUrl: "https://example.supabase.co",
      turnstileSiteKey: "site-key",
    });
  });
});
