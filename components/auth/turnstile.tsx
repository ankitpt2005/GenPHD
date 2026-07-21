"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    callback: (token: string) => void;
    "error-callback": () => void;
    "expired-callback": () => void;
    sitekey: string;
    theme: "dark";
  }) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileProps = {
  onError: (message: string) => void;
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
  siteKey: string;
};

export function Turnstile({ onError, onTokenChange, resetSignal, siteKey }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !isLoaded || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token) => {
        onError("");
        onTokenChange(token);
      },
      "expired-callback": () => {
        onTokenChange(null);
        onError("Human verification expired. Please complete it again.");
      },
      "error-callback": () => {
        onTokenChange(null);
        onError("Human verification could not load. Please refresh and try again.");
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [isLoaded, onError, onTokenChange, siteKey]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenChange(null);
    }
  }, [onTokenChange, resetSignal]);

  if (!siteKey) {
    return <p className="auth-captcha-error" role="alert">Human verification is unavailable. Ask an administrator to configure Turnstile before signing in.</p>;
  }

  return (
    <div className="auth-captcha" aria-label="Human verification">
      <Script id="turnstile-script" onLoad={() => setIsLoaded(true)} src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div ref={containerRef} />
    </div>
  );
}
