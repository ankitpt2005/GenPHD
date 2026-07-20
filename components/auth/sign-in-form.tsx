"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";

export function SignInForm({ mode = "login" }: { mode?: "login" | "signup" }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const actionLabel = mode === "signup" ? "Create account with email" : "Email me a sign-in link";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: mode === "signup",
      },
    });

    if (authError) {
      setError("We could not send the sign-in link. Check the email address and try again.");
      setIsSubmitting(false);
      return;
    }

    setIsSent(true);
    setIsSubmitting(false);
  }

  if (isSent) {
    return (
      <div className="auth-confirmation" role="status">
        <Mail aria-hidden="true" size={19} />
        <div>
          <strong>Check your inbox</strong>
          <p>We sent a secure {mode === "signup" ? "account" : "sign-in"} link to {email.trim()}. Open it in this browser to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">Email address</label>
      <input
        autoComplete="email"
        id="email"
        inputMode="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      {error ? <p className="inline-error" role="alert">{error}</p> : null}
      <button className="button button-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending link..." : actionLabel}
        <ArrowRight aria-hidden="true" size={16} />
      </button>
    </form>
  );
}
