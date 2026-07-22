import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import type { ReactNode } from "react";
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

const navigation = [
  ["Home", "/"],
  ["About", "/about"],
  ["How it works", "/services"],
  ["Field notes", "/feedback"],
  ["Contact", "/contact"],
] as const;

const footerNavigation = [
  {
    title: "Explore",
    links: [
      ["About GenPHD", "/about", "https://app.notion.com/p/3a4a7ebae27d8165ab01c0b323adcd50"],
      ["How it works", "/services", "https://app.notion.com/p/3a4a7ebae27d81afb848fe790634ff34"],
      ["Field notes", "/feedback", "https://app.notion.com/p/3a4a7ebae27d81a8a335d3f1e34abb84"],
    ],
  },
  {
    title: "Workspace",
    links: [
      ["Start a project", "/signup", "https://app.notion.com/p/3a4a7ebae27d816ca4d9c13354a7c3bd"],
      ["Sign in", "/login", "https://app.notion.com/p/3a4a7ebae27d812e9eddc141989b021a"],
      ["Contact", "/contact", "https://app.notion.com/p/3a4a7ebae27d81e28407d89dd25b6bac"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Privacy", "/privacy", "https://app.notion.com/p/3a4a7ebae27d81f3ae65ca39a709dd37"],
      ["Terms", "/terms", "https://app.notion.com/p/3a4a7ebae27d81ebbc7fc63ae04c3dfa"],
      ["Policies", "/legal", "https://app.notion.com/p/3a4a7ebae27d812f952be0b6481b3194"],
    ],
  },
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
    <footer className="public-footer">
      <div className="footer-intro">
        <p className="eyebrow">GenPHD</p>
        <h2>Clear thinking<br />for what you build next.</h2>
        <p>Decision intelligence for AI engineers who want evidence, momentum, and a workspace that remembers the important things.</p>
      </div>
      <div className="footer-links">
        {footerNavigation.map((section) => (
          <div key={section.title}>
            <p className="eyebrow">{section.title}</p>
            {section.links.map(([label, liveHref, notionHref]) => (
              <div className="footer-link-item" key={label}>
                <a aria-label={`${label} Notion document, opens in a new tab`} className="footer-notion-link" href={notionHref} rel="noreferrer" target="_blank">
                  {label} <ArrowUpRight aria-hidden="true" size={12} />
                </a>
                <Link className="footer-site-link" href={liveHref}>Live page</Link>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 GenPHD</span>
        <span>Built for deliberate AI work.</span>
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
        <div className="statement-field" aria-hidden="true">
          <span className="statement-field-caption">GENPHD / DECISION FIELD</span>
          <span className="statement-field-index">01</span>
          <span className="statement-field-dot" />
          <strong>G</strong>
          <span className="statement-field-line line-one" />
          <span className="statement-field-line line-two" />
        </div>
        <div>
          <p className="eyebrow">The GenPHD approach</p>
          <h2 id="statement-title">Think clearly. Build deliberately. Remember what matters.</h2>
          <p>GenPHD is a private decision workspace for the moments when an AI project needs a clearer path—not more noise.</p>
          <Link className="text-action" href="/about">Meet the approach <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className="principles-section" aria-labelledby="principles-title">
        <div className="section-label">
          <p className="eyebrow">The loop</p>
          <h2 id="principles-title">A calm system for forward motion.</h2>
          <p className="principles-aside-note">One grounded decision can change the quality of every build step that follows.</p>
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
      <section className="editorial-page-heading" aria-labelledby="about-title">
        <p className="eyebrow">About GenPHD</p>
        <h1 id="about-title">AI engineering deserves a clearer working memory.</h1>
        <p>GenPHD was shaped around a simple observation: when project context is scattered, even good advice becomes difficult to use.</p>
      </section>
      <section className="about-manifesto" aria-label="Our working principles">
        <div className="manifesto-graphic" aria-hidden="true"><span>01</span><span>G</span><span>∞</span></div>
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

export function ServicesPage() {
  return (
    <MarketingPage className="marketing-services">
      <PublicHeader />
      <section className="editorial-page-heading services-heading" aria-labelledby="services-title">
        <p className="eyebrow">How GenPHD helps</p>
        <h1 id="services-title">A practical intelligence layer for your AI project.</h1>
        <p>Each part of the workspace has one job: help you make, test, and retain better engineering decisions.</p>
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
