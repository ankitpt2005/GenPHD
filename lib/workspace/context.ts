import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "../supabase/config";
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
    return { mode: "demo" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new AuthenticationRequiredError();
  }

  return { mode: "persistent", supabase, userId: data.user.id };
}
