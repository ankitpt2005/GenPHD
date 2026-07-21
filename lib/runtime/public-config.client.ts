"use client";

import type { PublicRuntimeConfig } from "../supabase/config";

declare global {
  interface Window {
    __GENPHD_PUBLIC_CONFIG__?: PublicRuntimeConfig;
  }
}

export function getBrowserPublicRuntimeConfig(): PublicRuntimeConfig {
  if (typeof window === "undefined") return {};

  const root = document.body;
  return {
    supabasePublishableKey: root.dataset.genphdSupabasePublishableKey,
    supabaseUrl: root.dataset.genphdSupabaseUrl,
    turnstileSiteKey: root.dataset.genphdTurnstileSiteKey,
  };
}
