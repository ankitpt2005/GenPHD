"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getBrowserPublicRuntimeConfig } from "../runtime/public-config.client";

export function createSupabaseBrowserClient() {
  const config = getBrowserPublicRuntimeConfig();

  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return createBrowserClient(config.supabaseUrl, config.supabasePublishableKey);
}
