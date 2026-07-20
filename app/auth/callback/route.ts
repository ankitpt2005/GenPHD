import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/", requestUrl.origin);
  const code = requestUrl.searchParams.get("code");

  if (!isSupabaseConfigured() || !code) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "signin_unavailable");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "signin_failed");
  }

  return NextResponse.redirect(redirectUrl);
}
