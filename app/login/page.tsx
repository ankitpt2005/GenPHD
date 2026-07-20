import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SignInForm } from "../../components/auth/sign-in-form";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default function LoginPage() {
  const isConfigured = isSupabaseConfigured();

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
        <p className="auth-description">Sign in to save Decision Briefs, build missions, and learning evidence privately in your Supabase workspace.</p>
        {isConfigured ? (
          <SignInForm />
        ) : (
          <div className="auth-setup-note">
            <ShieldCheck aria-hidden="true" size={18} />
            <p><strong>Demo mode is active.</strong> Add the Supabase URL and anon key to <code>.env.local</code>, then restart the app to enable private cloud workspaces.</p>
          </div>
        )}
      </section>
    </main>
  );
}
