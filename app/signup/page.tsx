import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SignInForm } from "../../components/auth/sign-in-form";
import { getPublicRuntimeConfig, isSupabaseConfigured, isTurnstileConfigured } from "../../lib/supabase/config";

export default function SignupPage() {
  const turnstileSiteKey = getPublicRuntimeConfig().turnstileSiteKey;
  const isConfigured = isSupabaseConfigured() && isTurnstileConfigured();

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="signup-title">
        <Link className="auth-back-link" href="/"><ArrowLeft aria-hidden="true" size={15} />Back to GenPHD</Link>
        <div className="auth-mark">G</div>
        <p className="eyebrow">Your first project</p>
        <h1 id="signup-title">Start with one project.</h1>
        <p className="auth-description">Create a private workspace protected by a strong password, CAPTCHA verification, and server-validated sessions.</p>
        {isConfigured ? <SignInForm mode="signup" redirectPath="/onboarding" turnstileSiteKey={turnstileSiteKey ?? ""} /> : <div className="auth-setup-note"><ShieldCheck aria-hidden="true" size={18} /><p><strong>Secure sign-up is not configured.</strong> Add the Supabase public values and Turnstile site key before creating accounts.</p></div>}
        <p className="auth-switch">Already have a workspace? <Link href="/login">Sign in</Link>.</p>
      </section>
    </main>
  );
}
