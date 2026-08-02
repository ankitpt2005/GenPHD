"use client";

import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "./brand-logo";
import { useState, useEffect, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  Compass,
  Database,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type MarketingPageProps = {
  children: ReactNode;
  className?: string;
};

const userFeedbacks = [
  {
    name: "Dr. Aris Thorne",
    role: "Lead AI Research Engineer @ NeuralScale",
    feedback: "GenPHD cut our architecture decision loops from days to hours. Retaining historical context across model updates keeps our build trajectory completely grounded.",
  },
  {
    name: "Elena Rostova",
    role: "Principal Systems Architect @ Datavane",
    feedback: "The consensus and evidence grounding feature prevents endless team debate. We turn complex trade-offs into testable build missions immediately.",
  },
  {
    name: "Marcus Vance",
    role: "Head of Infrastructure @ MindGraph",
    feedback: "Unlike generic AI chat tools, GenPHD actually remembers our technical constraints and past post-mortems so we never repeat past architectural mistakes.",
  },
  {
    name: "Priya Nair",
    role: "Senior Staff AI Engineer @ Contextual AI",
    feedback: "The calm, deliberate interface gives our team focus. Converting ambiguous technical blockers into structured briefs has doubled our shipping velocity.",
  },
  {
    name: "David Chen",
    role: "CTO & Co-founder @ HyperLogic",
    feedback: "GenPHD feels like pair-programming with an ultra-deliberate principal engineer. It keeps us focused on what matters from day one.",
  },
  {
    name: "Sarah Lindqvist",
    role: "Lead ML Engineer @ Synthetica",
    feedback: "Having a private workspace that tracks decision history and rationale has transformed how our team documents critical model trade-offs.",
  },
] as const;

function UserFeedbackCarousel() {
  const [index, setIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % userFeedbacks.length);
        setFadeState("in");
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = userFeedbacks[index];

  return (
    <div className="user-feedback-clean">
      <div className="feedback-badge-clean">
        <MessageSquare size={12} /> USER FEEDBACK
      </div>
      <div className={`feedback-clean-body ${fadeState === "in" ? "fade-in" : "fade-out"}`}>
        <p className="feedback-text-clean">&ldquo;{current.feedback}&rdquo;</p>
        <div className="feedback-author-clean">
          <h4 className="feedback-name-clean">{current.name}</h4>
          <p className="feedback-role-clean">{current.role}</p>
        </div>
      </div>
    </div>
  );
}

const navigation = [
  ["Home", "/"],
  ["About", "/about"],
  ["How it works", "/services"],
  ["Field notes", "/feedback"],
  ["Contact", "/contact"],
] as const;

export function PublicHeader() {
  return (
    <header className="public-header">
      <Link aria-label="GenPHD home" className="brand public-brand" href="/">
        <BrandLogo className="public-brand-logo" priority />
      </Link>
      <nav aria-label="Public navigation" className="public-nav">
        {navigation.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <Link className="button button-secondary public-sign-in" href="/login">Sign in</Link>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="djaen-footer-container">
      <div className="djaen-footer-content">
        {/* Column 1: Brand & Tagline */}
        <div className="djaen-footer-col col-brand">
          <Link aria-label="GenPHD home" className="djaen-footer-brand" href="/">
            <BrandLogo className="public-brand-logo" priority />
          </Link>
          <p className="djaen-footer-desc">
            Decision intelligence layer for AI engineering projects. Grounded in evidence, momentum, and clear architectural choices.
          </p>
        </div>

        {/* Column 2: Explore Navigation */}
        <div className="djaen-footer-col">
          <h4 className="djaen-footer-col-title">Explore</h4>
          <ul className="djaen-footer-links-list">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/services">How it works</Link></li>
            <li><Link href="/feedback">Field notes</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/diagnostic">Diagnostic</Link></li>
          </ul>
        </div>

        {/* Column 3: Platform Navigation */}
        <div className="djaen-footer-col">
          <h4 className="djaen-footer-col-title">Platform</h4>
          <ul className="djaen-footer-links-list">
            <li><Link href="/signup">Start a project</Link></li>
            <li><Link href="/consensus">Consensus Engine</Link></li>
            <li><Link href="/memory">Decision Memory</Link></li>
            <li><Link href="/roadmap">Build Roadmap</Link></li>
            <li><Link href="/login">Sign in</Link></li>
          </ul>
        </div>

        {/* Column 4: Location, Contact & Social Icons */}
        <div className="djaen-footer-col col-contact">
          <h4 className="djaen-footer-col-title">Contact</h4>
          <p className="djaen-contact-line">GenPHD Labs, AI Research Hub</p>
          <p className="djaen-contact-detail">t. +1 (800) 555-GENP</p>
          <p className="djaen-contact-detail">e. contact@genphd.ai</p>
          <div className="djaen-footer-socials">
            <a href="https://github.com/ankitpt2005/GenPHD" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 4.5A16.5 16.5 0 0 0 3 6c-1 4.5 0 9 2 12.5a16.5 16.5 0 0 0 6 2.5 16.5 16.5 0 0 0 6-2.5c2-3.5 3-8 2-12.5a16.5 16.5 0 0 0-4.5-1.5"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal Copyright Bar */}
      <div className="djaen-footer-bottom-bar">
        <div className="djaen-footer-bottom-content">
          <span>Copyright © 2026 GenPHD Inc. All rights reserved.</span>
          <div className="djaen-footer-bottom-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <span className="dot-sep">•</span>
            <Link href="/terms">Terms of Use</Link>
            <span className="dot-sep">•</span>
            <Link href="/legal">Policies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function MarketingPage({ children, className = "" }: MarketingPageProps) {
  return <main className={`marketing-shell ${className}`}>{children}</main>;
}

const principles = [
  ["Make the decision visible", "Turn a vague technical blocker into a brief with a recommendation, counterfactual, confidence, and evidence."],
  ["Turn thought into a mission", "Every recommendation becomes a small, testable build action instead of another tab you mean to revisit."],
  ["Keep the learning", "Record what changed, why it worked, and what should shape the next decision for this project."],
] as const;

const serviceCards = [
  [Compass, "Decision briefs", "Ask a focused engineering question and get a traceable recommendation with sources, uncertainty, and a practical alternative."],
  [BrainCircuit, "Evidence-aware roadmap", "Sequence skills and project milestones around what your product needs next, not a generic curriculum."],
  [Check, "Build missions", "Move from advice to a bounded outcome with acceptance criteria, effort, and a clear definition of done."],
  [Database, "Learning memory", "Retain important constraints, experiments, and outcomes so useful context survives beyond a single chat."],
] as const;

const fieldNotes = [
  ["A narrower first version", "A build decision became simpler once its evidence, scope, and unknowns were written in one place.", "Decision design"],
  ["Retrieval before orchestration", "A project avoided unnecessary complexity by validating its retrieval path with a focused mission first.", "Build evidence"],
  ["Memory with a reason", "Learning notes became useful when they were tied back to the next project choice—not stored as an archive.", "Project memory"],
] as const;

export function MarketingLandingPage() {
  return (
    <MarketingPage className="marketing-home">
      <PublicHeader />
      <section className="editorial-hero" aria-labelledby="marketing-title">
        <div className="hero-video-bg">
          <video autoPlay loop muted playsInline className="hero-video-element">
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Decision intelligence for AI engineers</p>
          <h1 id="marketing-title">Just the right next move.</h1>
          <p className="hero-description">GenPHD turns scattered technical advice into one evidence-backed action for the project you are building now.</p>
          <div className="marketing-actions">
            <Link className="button button-primary" href="/signup">Start one project <ArrowRight size={16} /></Link>
            <Link className="text-action" href="/services">How GenPHD works <ArrowUpRight size={16} /></Link>
          </div>
        </div>
        <div className="hero-composition" aria-label="A decision becomes an evidence-backed build mission">
          <div className="hero-vertical-label">PROJECT CONTEXT · EVIDENCE · ACTION</div>
          <div className="hero-ledger" aria-hidden="true">
            <span>Evidence / 03</span>
            <span>Confidence / considered</span>
            <span>Next move / defined</span>
          </div>
          <article className="hero-brief">
            <p className="eyebrow">Current decision</p>
            <h2>What should I validate before I build more?</h2>
            <div className="brief-rule" />
            <p>Start with the retrieval path. Capture five realistic questions before adding orchestration.</p>
            <span><Check size={14} /> Evidence-aware recommendation</span>
          </article>
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-index">01 — today</div>
        </div>
      </section>

      <section className="marketing-statement" aria-labelledby="statement-title">
        <div className="statement-video-only">
          <video autoPlay loop muted playsInline className="statement-video-element">
            <source src="/statement-video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="statement-copy">
          <p className="eyebrow">The GenPHD approach</p>
          <h2 id="statement-title">Think clearly. Build deliberately. Remember what matters.</h2>
          <p>GenPHD is a private decision workspace for the moments when an AI project needs a clearer path—not more noise.</p>
          <div className="statement-proof" aria-label="GenPHD core capabilities">
            <span>Private workspace</span><span>Evidence grounded</span><span>Action focused</span>
          </div>
          <Link className="text-action" href="/about">Meet the approach <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className="principles-section" aria-labelledby="principles-title">
        <div className="section-label">
          <p className="eyebrow">The loop</p>
          <h2 id="principles-title">A calm system for forward motion.</h2>
          <p className="principles-aside-note">One grounded decision can change the quality of every build step that follows.</p>
          <UserFeedbackCarousel />
        </div>
        <ol className="principle-list">
          {principles.map(([title, detail], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <div><h3>{title}</h3><p>{detail}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="marketing-cta" aria-labelledby="cta-title">
        <p className="eyebrow">Your workspace, not another feed</p>
        <h2 id="cta-title">Start with the decision in front of you.</h2>
        <p>Keep context, evidence, and the next practical action together from the first project onward.</p>
        <div className="cta-proof" aria-label="GenPHD workspace principles">
          <span>Private workspace</span><span>Evidence shown</span><span>Action focused</span>
        </div>
        <Link className="button button-primary" href="/signup">Create your workspace <ArrowRight size={16} /></Link>
      </section>
      <PublicFooter />
    </MarketingPage>
  );
}

export function AboutPage() {
  return (
    <MarketingPage className="marketing-about">
      <PublicHeader />
      <section className="editorial-page-heading about-page-heading" aria-labelledby="about-title">
        <div className="about-heading-bg" aria-hidden="true">
          <Image
            src="/about-user-bg.png"
            alt=""
            className="about-bg-img"
            fill
            priority
          />
          <div className="about-bg-gradient-overlay" />
        </div>

        <div className="about-heading-content">
          <p className="eyebrow">About GenPHD</p>
          <h1 id="about-title">AI engineering deserves a clearer working memory.</h1>
          <p>GenPHD was shaped around a simple observation: when project context is scattered, even good advice becomes difficult to use.</p>
          <div className="about-proof-pills">
            <span>Private workspace</span>
            <span>Traceable context</span>
            <span>Action scoped</span>
          </div>
        </div>
      </section>
      <section className="about-manifesto" aria-label="Our working principles">
        <div className="manifesto-graphic" aria-hidden="true">
          <div className="manifesto-slab manifesto-slab-left">
            <div className="slate-scan-line" />
            <div className="slate-ambient-pulse" />
            <div className="slab-corner-bracket top-right">+</div>
            <div className="slab-corner-bracket bottom-left">+</div>
            <div className="slab-connecting-beam">
              <span className="beam-node" />
            </div>
            <div className="slab-top">
              <div className="slab-top-header">
                <span className="slab-index">01</span>
                <span className="slab-label">FOUNDATION</span>
              </div>
              <div className="slab-meta-row">
                <span className="slab-sub-text">Context defined</span>
                <span className="slab-telemetry">RAW · 100%</span>
              </div>
            </div>
            <div className="slab-center-connector">
              <span className="connector-line" />
              <span className="connector-dot" />
              <span className="connector-pulse-wave" />
            </div>
            <div className="slab-bottom">
              <div className="symbol-wrap">
                <span className="slab-symbol">∞</span>
                <div className="symbol-pulse-ring" />
                <div className="symbol-orbit-dot" />
              </div>
              <div className="slab-bottom-meta">
                <span className="slab-bottom-label">Forward motion</span>
                <span className="slab-telemetry">LOOP ACTIVE</span>
              </div>
            </div>
          </div>
          <div className="manifesto-slab manifesto-slab-right">
            <div className="marble-vein-overlay" />
            <div className="marble-light-sweep" />
            <div className="g-artwork-ambient-ring" />
            <Image
              src="/g-artwork.jpg"
              alt="Floral calligraphic G artwork"
              className="manifesto-g-artwork-img"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
        <div className="manifesto-copy">
          <p className="eyebrow">What we believe</p>
          <h2>More information does not always create more progress.</h2>
          <p>The useful question is smaller: given this project, this evidence, and this constraint—what is the next responsible thing to test?</p>
          <p>GenPHD brings that question into focus, then keeps the answer and outcome available for the next one.</p>
        </div>
      </section>
      <section className="about-values">
        <article><span>01</span><h2>Private by default</h2><p>Your project context belongs in your workspace, with visible controls over what is stored.</p></article>
        <article><span>02</span><h2>Honest about uncertainty</h2><p>Recommendations show their evidence, their limits, and the alternative case instead of pretending to be certain.</p></article>
        <article><span>03</span><h2>Built for doing</h2><p>Each decision should leave you with a small, meaningful action you can finish and learn from.</p></article>
      </section>
      <PublicFooter />
    </MarketingPage>
  );
}

function GenPHDMascot() {
  return (
    <div className="genphd-mascot-box" aria-hidden="true" style={{ overflow: "hidden", position: "relative" }}>
      <video
        src="/mascot-robot.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1.12)",
          transformOrigin: "48% 45%",
          borderRadius: "20px",
          pointerEvents: "none",
        }}
      />
      {/* Corner Patch to guarantee 100% complete star symbol removal */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "80px", height: "80px", background: "#000000", pointerEvents: "none", zIndex: 10 }} />
    </div>
  );
}

export function ServicesPage() {
  return (
    <MarketingPage className="marketing-services">
      <PublicHeader />
      <section className="editorial-page-heading services-heading services-hero-container" aria-labelledby="services-title">
        <div className="services-hero-copy">
          <p className="eyebrow">How GenPHD helps</p>
          <h1 id="services-title" className="services-title-compact">A practical intelligence layer for your AI project.</h1>
          <p className="services-hero-desc">Each part of the workspace has one job: help you make, test, and retain better engineering decisions.</p>
        </div>

        <div className="mascot-container-fixed" aria-label="GenPHD AI Companion Mascot">
          <GenPHDMascot />
        </div>
      </section>
      <section className="services-grid" aria-label="GenPHD capabilities">
        {serviceCards.map(([Icon, title, detail], index) => (
          <article key={title} className="service-card">
            <div className="service-card-top"><span>0{index + 1}</span><Icon aria-hidden="true" size={22} /></div>
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
      <section className="service-bridge">
        <div><p className="eyebrow">The difference</p><h2>One project, one connected record.</h2></div>
        <p>Instead of treating research, decisions, missions, and learning as separate tools, GenPHD connects them around the work you are actually doing.</p>
      </section>
      <PublicFooter />
    </MarketingPage>
  );
}

export function FeedbackPage() {
  return (
    <MarketingPage className="marketing-feedback">
      <PublicHeader />
      <section className="editorial-page-heading feedback-heading" aria-labelledby="feedback-title">
        <p className="eyebrow">Field notes</p>
        <h1 id="feedback-title">Small signals from thoughtful AI work.</h1>
        <p>Patterns we keep seeing when builders slow down just enough to make the next decision traceable.</p>
      </section>
      <section className="field-note-grid" aria-label="Field notes">
        {fieldNotes.map(([title, summary, category], index) => (
          <article className="field-note" key={title}>
            <div className={`field-note-art art-${index + 1}`} aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>
            <p className="eyebrow">{category}</p>
            <h2>{title}</h2>
            <p>{summary}</p>
            <Link className="text-action" href="/signup">Use this in a project <ArrowUpRight size={16} /></Link>
          </article>
        ))}
      </section>
      <section className="feedback-prompt">
        <MessageSquare aria-hidden="true" size={22} />
        <div><p className="eyebrow">Shape what comes next</p><h2>Have a workflow that needs clearer thinking?</h2></div>
        <Link className="button button-secondary" href="/contact">Send feedback <ArrowRight size={16} /></Link>
      </section>
      <PublicFooter />
    </MarketingPage>
  );
}

export function MarketingContactPage() {
  return (
    <MarketingPage className="marketing-contact">
      <PublicHeader />
      <section className="contact-composition" aria-labelledby="contact-title">
        <div className="contact-background-block block-one" aria-hidden="true" />
        <div className="contact-background-block block-two" aria-hidden="true" />
        <div className="contact-background-block block-three" aria-hidden="true" />
        <div className="contact-callout">
          <p className="eyebrow">Contact GenPHD</p>
          <h1 id="contact-title">Bring us the question you are working through.</h1>
          <p>Share product feedback, a support need, or an idea that would make GenPHD more useful for your next build.</p>
          <a className="button button-primary" href="https://github.com/ankitpt2005/GenPHD/issues" rel="noreferrer" target="_blank">Open project support <ArrowUpRight size={16} /></a>
          <p className="contact-note"><ShieldCheck aria-hidden="true" size={15} /> Please do not include passwords, API keys, or private project material in a public issue.</p>
        </div>
        <aside className="contact-aside">
          <span className="contact-aside-index">01—</span>
          <Sparkles aria-hidden="true" size={28} />
          <p>Thoughtful feedback is part of the product.</p>
        </aside>
      </section>
      <PublicFooter />
    </MarketingPage>
  );
}

export { MarketingLandingPage as LandingPage };

