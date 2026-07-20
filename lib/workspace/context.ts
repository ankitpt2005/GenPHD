import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoModeEnabled, isSupabaseConfigured } from "../supabase/config";
import { createSupabaseServerClient } from "../supabase/server";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Sign in to save decisions and learning evidence to your cloud workspace.");
  }
}

export type WorkspaceContext =
  | { mode: "demo" }
  | { mode: "persistent"; supabase: SupabaseClient; userId: string };

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  if (!isSupabaseConfigured()) {
    if (isDemoModeEnabled()) return { mode: "demo" };
    throw new AuthenticationRequiredError();
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    throw new AuthenticationRequiredError();
  }

  return { mode: "persistent", supabase, userId };
}
