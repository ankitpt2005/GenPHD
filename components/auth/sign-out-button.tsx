"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/login");
    router.refresh();
  }

  return <button className="button button-secondary sign-in-link" disabled={isSigningOut} onClick={signOut} type="button">{isSigningOut ? "Signing out..." : "Sign out"}</button>;
}
