import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SignInForm } from "../../components/auth/sign-in-form";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default function SignupPage() {
  const isConfigured = isSupabaseConfigured();

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="signup-title">
        <Link className="auth-back-link" href="/"><ArrowLeft aria-hidden="true" size={15} />Back to GenPHD</Link>
        <div className="auth-mark">G</div>
        <p className="eyebrow">Your first project</p>
        <h1 id="signup-title">Start with one project.</h1>
        <p className="auth-description">Create a private workspace, then add the goal and blocker that should shape your first recommendation.</p>
        {isConfigured ? <SignInForm mode="signup" /> : <div className="auth-setup-note"><ShieldCheck aria-hidden="true" size={18} /><p><strong>Demo mode is active.</strong> You can begin the full setup without an account and connect Supabase later.</p></div>}
        <p className="auth-switch">Already have a workspace? <Link href="/login">Sign in</Link>.</p>
        {!isConfigured ? <Link className="button button-primary" href="/onboarding">Continue in demo mode</Link> : null}
      </section>
    </main>
  );
}
