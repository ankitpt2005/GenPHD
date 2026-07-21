import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { safeWorkspacePath } from "../../../lib/auth/routes";
import { getSupabaseConfig, isSupabaseConfigured } from "../../../lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL(safeWorkspacePath(requestUrl.searchParams.get("next"), "/dashboard"), requestUrl.origin);
  const code = requestUrl.searchParams.get("code");

  if (!isSupabaseConfigured() || !code) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "signin_unavailable");
    return NextResponse.redirect(redirectUrl);
  }

  // Exchange the verification code using the request cookies, then explicitly
  // carry Supabase's newly issued session cookies onto the dashboard redirect.
  // Without this handoff, the user can briefly land on the public sign-in flow
  // before middleware sees the authenticated session.
  const sessionResponse = NextResponse.next();
  const config = getSupabaseConfig();
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => sessionResponse.cookies.set(name, value, options));
      },
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "signin_failed");
  }

  const response = NextResponse.redirect(redirectUrl);
  sessionResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}
