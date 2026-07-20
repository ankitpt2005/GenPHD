"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, Check, ShieldCheck } from "lucide-react";

function DocumentShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return <main className="document-shell"><section className="document-column"><p className="eyebrow">GenPHD</p><h1>{title}</h1><p className="page-description">{description}</p>{children}</section></main>;
}

export function LegalIndexPage() {
  return <DocumentShell title="Policies and support" description="Clear information about your workspace, data, and available support."><nav aria-label="Policy links" className="document-links"><Link href="/privacy">Privacy <ArrowRight size={15} /></Link><Link href="/terms">Terms <ArrowRight size={15} /></Link><Link href="/contact">Contact <ArrowRight size={15} /></Link></nav></DocumentShell>;
}

export function PrivacyPage() {
  return <DocumentShell title="Privacy" description="Effective 20 July 2026. GenPHD is designed around visible, project-scoped memory."><section className="document-section"><h2>What is stored</h2><p>Project context, decisions, mission outcomes, and learning evidence are stored only to improve your next project decision. Secrets and raw source code are not stored as memory.</p></section><section className="document-section"><h2>Your controls</h2><p>You can inspect, correct, export, or remove visible memory. In demo mode, information stays in your browser session. Cloud workspaces use the authenticated account and project scope.</p></section><section className="document-section"><h2>Sources and AI</h2><p>Technical recommendations show their available evidence and uncertainty. Provider credentials remain on the server and are never sent to the browser.</p></section><p className="document-footer"><Link href="/contact">Ask a privacy question</Link></p></DocumentShell>;
}

export function TermsPage() {
  return <DocumentShell title="Terms" description="Effective 20 July 2026. GenPHD is decision support for engineering work."><section className="document-section"><h2>Use responsibly</h2><p>You remain responsible for validating code, technical choices, security, and production deployments. Recommendations are not guarantees or professional advice.</p></section><section className="document-section"><h2>AI limitations</h2><p>Evidence may be incomplete and model output can be unavailable. GenPHD labels uncertainty and keeps a deterministic fallback so a provider outage does not become a fabricated recommendation.</p></section><section className="document-section"><h2>Your workspace</h2><p>Keep account access secure and do not place credentials or sensitive personal data into project context.</p></section><p className="document-footer"><Link href="/contact">Contact the project team</Link></p></DocumentShell>;
}

export function NotificationsPage() {
  const [isRead, setIsRead] = useState(false);
  return <DocumentShell title="Notifications" description="Only changes that need an action appear here."><section className="empty-state"><Bell aria-hidden="true" size={20} /><h2>{isRead ? "You are up to date" : "No action needed today"}</h2><p>Decision reviews, active mission reminders, and material source changes will appear when they affect your project.</p><div className="secondary-actions"><button className="button button-ghost" onClick={() => setIsRead(true)} type="button">Mark all read</button><Link className="button button-primary" href="/dashboard">Review today’s action <ArrowRight size={16} /></Link></div></section></DocumentShell>;
}

export function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("AI builder");
  const [goal, setGoal] = useState("Build credible AI engineering projects");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.sessionStorage.setItem("genphd-profile-preview", JSON.stringify({ name, goal }));
    setSaved(true);
  }

  return <DocumentShell title="Profile" description="Your explicit goals and preferences shape recommendations; GenPHD does not infer personality scores."><form className="profile-form" onSubmit={saveProfile}><label htmlFor="profile-name">Display name<input id="profile-name" onChange={(event) => setName(event.target.value)} value={name} /></label><label htmlFor="profile-goal">Career goal<textarea id="profile-goal" onChange={(event) => setGoal(event.target.value)} rows={3} value={goal} /></label><label htmlFor="profile-stack">Preferred stack<input defaultValue="Python, TypeScript, retrieval systems" id="profile-stack" /></label><label htmlFor="profile-time">Weekly availability<select defaultValue="6" id="profile-time"><option value="2">2 hours</option><option value="4">4 hours</option><option value="6">6 hours</option><option value="10">10 hours</option></select></label>{saved ? <p className="success-note" role="status"><Check aria-hidden="true" size={15} /> Profile preview saved for this session. Connect Supabase to persist it privately.</p> : null}<button className="button button-primary" type="submit">Save profile</button></form></DocumentShell>;
}

export function ContactPage() {
  return <DocumentShell title="Contact" description="For product feedback and development support, use the project’s tracked support channel."><section className="empty-state"><ShieldCheck aria-hidden="true" size={20} /><h2>Send feedback safely</h2><p>This development workspace does not transmit support messages itself. Use the project issue tracker for product feedback, and avoid posting credentials or private project material.</p><a className="button button-primary" href="https://github.com/ankitpt2005/GenPHD/issues" rel="noreferrer" target="_blank">Open project support <ArrowRight size={16} /></a></section></DocumentShell>;
}
