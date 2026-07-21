import type { Metadata } from "next";
import { getPublicRuntimeConfig } from "../lib/supabase/config";
import "./globals.css";

// Render public configuration at request time. Render supplies these values at
// container runtime, rather than while the Docker image is built.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GenPHD — Decision intelligence for AI engineers",
  description: "Turn conflicting AI advice into an evidence-backed next build action.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publicConfig = getPublicRuntimeConfig();

  return (
    <html lang="en">
      <body
        data-genphd-supabase-publishable-key={publicConfig.supabasePublishableKey}
        data-genphd-supabase-url={publicConfig.supabaseUrl}
        data-genphd-turnstile-site-key={publicConfig.turnstileSiteKey}
      >
        {children}
      </body>
    </html>
  );
}
