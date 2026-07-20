"use client";

import type { PublicRuntimeConfig } from "../supabase/config";

declare global {
  interface Window {
    __GENPHD_PUBLIC_CONFIG__?: PublicRuntimeConfig;
  }
}

export function getBrowserPublicRuntimeConfig(): PublicRuntimeConfig {
  if (typeof window === "undefined") return {};
  return window.__GENPHD_PUBLIC_CONFIG__ ?? {};
}
