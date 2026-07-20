"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";
import { Turnstile } from "./turnstile";

type SignInFormProps = {
  mode?: "login" | "signup";
  redirectPath?: string;
};

function isStrongPassword(password: string) {
  const characterGroups = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((pattern) => pattern.test(password));
  return password.length >= 12 && characterGroups.length >= 3;
}

export function SignInForm({ mode = "login", redirectPath = "/dashboard" }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const isSignup = mode === "signup";
  const passwordIsStrong = isStrongPassword(password);
  const actionLabel = isSignup ? "Create private workspace" : "Sign in securely";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("Complete human verification before continuing.");
      return;
    }

    if (isSignup && !passwordIsStrong) {
      setError("Use at least 12 characters and at least three character types for your password.");
      return;
    }

    setIsSubmitting(true);
    const normalizedEmail = email.trim();
    const supabase = createSupabaseBrowserClient();

    try {
      if (isSignup) {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", "/onboarding");
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            captchaToken,
            emailRedirectTo: callbackUrl.toString(),
          },
        });

        if (authError) throw authError;

        if (data.session) {
          router.replace("/onboarding");
          router.refresh();
          return;
        }

        setIsSent(true);
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
          options: { captchaToken },
        });

        if (authError || !data.session) throw authError ?? new Error("No active session was created.");
        router.replace(redirectPath);
        router.refresh();
        return;
      }
    } catch {
      setError(isSignup
        ? "We could not create this workspace. Check your details and try again."
        : "We could not sign you in with those details. Check them and try again.");
    } finally {
      setCaptchaToken(null);
      setResetSignal((current) => current + 1);
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div className="auth-confirmation" role="status">
        <Mail aria-hidden="true" size={19} />
        <div>
          <strong>Confirm your email</strong>
          <p>We sent a confirmation link to {email.trim()}. Open it in this browser to activate your private workspace.</p>
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

      <label htmlFor="password">Password</label>
      <div className="auth-password-field">
        <LockKeyhole aria-hidden="true" size={16} />
        <input
          autoComplete={isSignup ? "new-password" : "current-password"}
          id="password"
          maxLength={128}
          minLength={isSignup ? 12 : 1}
          onChange={(event) => setPassword(event.target.value)}
          required
          type={showPassword ? "text" : "password"}
          value={password}
        />
        <button aria-label={showPassword ? "Hide password" : "Show password"} className="password-toggle" onClick={() => setShowPassword((current) => !current)} type="button">
          {showPassword ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
        </button>
      </div>
      {isSignup ? <p className={`password-requirement ${password && !passwordIsStrong ? "is-warning" : ""}`}><CheckCircle2 aria-hidden="true" size={14} /> Use 12+ characters with at least three character types.</p> : null}

      <Turnstile onError={setCaptchaError} onTokenChange={setCaptchaToken} resetSignal={resetSignal} />
      {captchaError ? <p className="inline-error" role="alert">{captchaError}</p> : null}
      {error ? <p className="inline-error" role="alert">{error}</p> : null}

      <button className="button button-primary" disabled={isSubmitting || !captchaToken || (isSignup && !passwordIsStrong)} type="submit">
        {isSubmitting ? "Securing your session..." : actionLabel}
        <ArrowRight aria-hidden="true" size={16} />
      </button>
      <p className="auth-security-note">Protected by Turnstile bot detection and server-verified Supabase sessions.</p>
    </form>
  );
}
