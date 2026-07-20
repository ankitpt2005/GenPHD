import { describe, expect, it } from "vitest";
import { getSupabaseConfig, isSupabaseConfigured } from "../../lib/supabase/config";

describe("Supabase configuration", () => {
  it("requires both public values before persistence is enabled", () => {
    expect(isSupabaseConfigured({})).toBe(false);
    expect(isSupabaseConfigured({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })).toBe(false);
    expect(
      isSupabaseConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(true);
  });

  it("returns only the public client configuration", () => {
    const config = getSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
    });

    expect(config).toEqual({ url: "https://example.supabase.co", anonKey: "anon-key" });
    expect(() => getSupabaseConfig({})).toThrow("Supabase is not configured");
  });
});
