import { ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SignInForm } from "../../components/auth/sign-in-form";
import { getPublicRuntimeConfig, isSupabaseConfigured, isTurnstileConfigured } from "../../lib/supabase/config";

export default function SignupPage() {
  const turnstileSiteKey = getPublicRuntimeConfig().turnstileSiteKey;
  const isConfigured = isSupabaseConfigured() && isTurnstileConfigured();

  return (
    <main className="auth-screen auth-login-screen">
      <section className="auth-panel auth-login-panel" aria-labelledby="signup-title">
        <aside className="auth-showcase" aria-label="How GenPHD helps you begin">
          <div className="auth-showcase-header">
            <span className="auth-showcase-dot" aria-hidden="true" />
            Your first project
          </div>
          <div className="auth-showcase-copy">
            <p className="eyebrow">A calm start for serious AI work</p>
            <h2>Build the right capability through the project.</h2>
            <p>Start with the project in front of you. GenPHD turns its context into a practical, evidence-aware path.</p>
          </div>
          <ol className="auth-showcase-steps">
            <li><span>01</span><div><strong>Describe the project</strong><small>Set the outcome, stack, constraints, and available time.</small></div></li>
            <li><span>02</span><div><strong>See the roadmap</strong><small>Get a small sequence of useful, connected milestones.</small></div></li>
            <li><span>03</span><div><strong>Record what matters</strong><small>Keep decisions and learning evidence with the work.</small></div></li>
          </ol>
          <p className="auth-showcase-footer">Private by default. Your workspace is scoped to you.</p>
        </aside>

        <section className="auth-form-panel">
          <Link className="auth-back-link" href="/"><ArrowLeft aria-hidden="true" size={15} />Back to GenPHD</Link>
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
          <p className="eyebrow">Your first project</p>
          <h1 id="signup-title">Start with one project.</h1>
          <p className="auth-description">Create a private workspace protected by a strong password, CAPTCHA verification, and server-validated sessions.</p>
          {isConfigured ? <SignInForm mode="signup" redirectPath="/onboarding" turnstileSiteKey={turnstileSiteKey ?? ""} /> : <div className="auth-setup-note"><ShieldCheck aria-hidden="true" size={18} /><p><strong>Secure sign-up is not configured.</strong> Add the Supabase public values and Turnstile site key before creating accounts.</p></div>}
          <p className="auth-switch">Already have a workspace? <Link href="/login">Sign in</Link>.</p>
        </section>
      </section>
    </main>
  );
}
