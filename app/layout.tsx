import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenPHD — Decision intelligence for AI engineers",
  description: "Turn conflicting AI advice into an evidence-backed next build action.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
