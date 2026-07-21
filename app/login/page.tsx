import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SignInForm } from "../../components/auth/sign-in-form";
import { safeWorkspacePath } from "../../lib/auth/routes";
import { getPublicRuntimeConfig, isSupabaseConfigured, isTurnstileConfigured } from "../../lib/supabase/config";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const turnstileSiteKey = getPublicRuntimeConfig().turnstileSiteKey;
  const isConfigured = isSupabaseConfigured() && isTurnstileConfigured();
  const redirectPath = safeWorkspacePath(params.next);
  const hasCallbackError = params.error === "signin_failed" || params.error === "signin_unavailable";

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="sign-in-title">
        <Link className="auth-back-link" href="/">
          <ArrowLeft aria-hidden="true" size={15} />
          Back to GenPHD
        </Link>
        <div className="auth-mark">G</div>
        <p className="eyebrow">Cloud workspace</p>
        <h1 id="sign-in-title">Keep your decisions with you.</h1>
        <p className="auth-description">Sign in to open your private workspace. Sessions are verified on the server before project data is available.</p>
        {isConfigured ? (
          <SignInForm redirectPath={redirectPath} turnstileSiteKey={turnstileSiteKey ?? ""} />
        ) : (
          <div className="auth-setup-note">
            <ShieldCheck aria-hidden="true" size={18} />
            <p><strong>Secure sign-in is not configured.</strong> Add the Supabase public values and Turnstile site key before opening workspaces.</p>
          </div>
        )}
        {hasCallbackError ? <p className="inline-error" role="alert">Your sign-in link was not accepted. Request a new one or sign in with your password.</p> : null}
        <p className="auth-switch">New to GenPHD? <Link href="/signup">Start with one project</Link>.</p>
      </section>
    </main>
  );
}
