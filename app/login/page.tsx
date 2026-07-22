import { ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
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
    <main className="auth-screen auth-login-screen">
      <section className="auth-panel auth-login-panel" aria-labelledby="sign-in-title">
        <aside className="auth-showcase" aria-label="About GenPHD">
          <div className="auth-showcase-header">
            <span className="auth-showcase-dot" aria-hidden="true" />
            Private decision workspace
          </div>
          <div className="auth-showcase-copy">
            <p className="eyebrow">Decision intelligence for AI engineers</p>
            <h2>Every strong build starts with a clear next move.</h2>
            <p>GenPHD turns project context, evidence, and practical work into one focused path forward.</p>
          </div>
          <ol className="auth-showcase-steps">
            <li><span>01</span><div><strong>Frame the decision</strong><small>Keep the project constraints in view.</small></div></li>
            <li><span>02</span><div><strong>Inspect the evidence</strong><small>Make trade-offs visible before committing.</small></div></li>
            <li><span>03</span><div><strong>Build the next move</strong><small>Turn guidance into a bounded mission.</small></div></li>
          </ol>
          <p className="auth-showcase-footer">Private by default. Your workspace is scoped to you.</p>
        </aside>

        <section className="auth-form-panel">
          <Link className="auth-back-link" href="/">
            <ArrowLeft aria-hidden="true" size={15} />
            Back to GenPHD
          </Link>
          <div className="login-logo-stage">
            <Image
              alt="GenPHD"
              className="login-logo"
              height={310}
              priority
              src="/brand/genphd-login-lockup.png"
              width={310}
            />
          </div>
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
      </section>
    </main>
  );
}
