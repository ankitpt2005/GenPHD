import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isWorkspacePath, safeWorkspacePath } from "../auth/routes";
import { getSupabaseConfig, isDemoModeEnabled, isSupabaseConfigured } from "./config";

function loginRedirect(request: NextRequest, response: NextResponse) {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const redirectResponse = NextResponse.redirect(redirectUrl);
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isWorkspaceRoute = isWorkspacePath(pathname);
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (!isWorkspaceRoute && !isAuthRoute) return NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return isWorkspaceRoute && !isDemoModeEnabled()
      ? loginRedirect(request, NextResponse.next({ request }))
      : NextResponse.next({ request });
  }

  const config = getSupabaseConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);

  if (isWorkspaceRoute && !isAuthenticated) return loginRedirect(request, response);

  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = new URL(safeWorkspacePath(request.nextUrl.searchParams.get("next"), "/dashboard"), request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
