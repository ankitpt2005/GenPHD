import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  Compass,
  Database,
  ShieldCheck,
  Menu,
  Search
} from "lucide-react";

type MarketingPageProps = {
  children: ReactNode;
  className?: string;
};

const navigation = [
  ["About", "/about"],
  ["How it works", "/services"],
  ["Field notes", "/feedback"],
  ["Contact", "/contact"],
] as const;

export function PublicHeader() {
  return (
    <header className="public-header new-public-header">
      <Link aria-label="GenPHD home" className="brand public-brand" href="/">
        <span className="brand-mark">G</span>
      </Link>
      <nav aria-label="Public navigation" className="public-nav">
        {navigation.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <Search className="header-icon" size={20} />
        <Menu className="header-icon" size={20} />
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer new-public-footer">
      <div className="footer-massive-brand">
        <h1>GenPHD</h1>
        <p className="footer-quote">
          &ldquo;Clear thinking for what you build next. Decision intelligence for AI engineers who want evidence, momentum, and a workspace that remembers.&rdquo;
        </p>
      </div>
      <div className="footer-columns-wrapper">
        <div className="footer-col">
          <h3 className="footer-col-title">Explore</h3>
          <div className="footer-links">
            <Link href="/about">About GenPHD</Link>
            <Link href="/services">How it works</Link>
            <Link href="/feedback">Field notes</Link>
          </div>
        </div>
        <div className="footer-col">
          <h3 className="footer-col-title">Workspace</h3>
          <div className="footer-links">
            <Link href="/signup">Start a project</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="footer-col">
          <h3 className="footer-col-title">Trust</h3>
          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
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

const serviceCards = [
  [Compass, "Decision briefs", "Ask a focused engineering question and get a traceable recommendation with sources."],
  [BrainCircuit, "Evidence roadmap", "Sequence skills and project milestones around what your product needs next."],
  [Check, "Build missions", "Move from advice to a bounded outcome with acceptance criteria and clear effort."],
  [Database, "Learning memory", "Retain important constraints, experiments, and outcomes so useful context survives."],
] as const;

const fieldNotes = [
  ["A narrower first version", "A build decision became simpler once its evidence, scope, and unknowns were written in one place.", "Decision design"],
  ["Retrieval before orchestration", "A project avoided unnecessary complexity by validating its retrieval path with a focused mission first.", "Build evidence"],
  ["Memory with a reason", "Learning notes became useful when they were tied back to the next project choice—not stored as an archive.", "Project memory"],
] as const;

export function MarketingLandingPage() {
  return (
    <MarketingPage className="marketing-home new-marketing-home">
      <PublicHeader />
      <section className="editorial-hero split-hero" aria-labelledby="marketing-title">
        <div className="hero-pane hero-left">
          <p className="eyebrow">GenPHD Intelligence</p>
          <h1 id="marketing-title">Just the right<br/>next move.</h1>
          <p className="hero-description">GenPHD turns scattered technical advice into one evidence-backed action for the project you are building now.</p>
          <Link className="button button-primary hero-btn" href="/signup">Learn more <ArrowRight size={16} /></Link>
        </div>
        <div className="hero-pane hero-right">
          <div className="hero-vertical-nav">
            <span>Workspace</span>
            <span>Missions</span>
            <span>Memory</span>
          </div>
        </div>
        <div className="hero-center-device">
          <div className="device-mockup">
            <div className="mockup-header">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <div className="mockup-body">
              <p className="mockup-eyebrow">Current decision</p>
              <h3>What should I validate before I build more?</h3>
              <div className="mockup-content">
                <p>Start with the retrieval path. Capture realistic questions.</p>
                <button className="mockup-btn">Create Mission</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}

export function AboutPage() {
  return (
    <MarketingPage className="marketing-about new-marketing-about">
      <PublicHeader />
      <section className="about-hero-section">
        <div className="about-illustration-col">
          <div className="abstract-art">
            <div className="shape box1"></div>
            <div className="shape box2"></div>
            <div className="shape box3"></div>
            <div className="shape circle"></div>
          </div>
        </div>
        <div className="about-text-col">
          <h1 id="about-title">Think clearly.<br/>Build deliberately.</h1>
          <p>More information does not always create more progress. The useful question is smaller: given this project, this evidence, and this constraint—what is the next responsible thing to test?</p>
          <Link className="button button-primary huge-btn" href="/signup">Learn More <ArrowRight size={16} /></Link>
        </div>
      </section>
      
      <section className="services-showcase">
        <div className="services-header-box">
          <p className="eyebrow">Capability</p>
          <h2>How GenPHD helps</h2>
        </div>
        <div className="new-services-grid">
          {serviceCards.map(([Icon, title, detail]) => (
            <article key={title} className="new-service-card">
              <div className="card-icon-wrapper">
                <Icon aria-hidden="true" size={28} />
              </div>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
      <PublicFooter />
    </MarketingPage>
  );
}

export function ServicesPage() {
  return <AboutPage />;
}

export function FeedbackPage() {
  return (
    <MarketingPage className="marketing-feedback new-marketing-feedback">
      <PublicHeader />
      <section className="feedback-heading-centered" aria-labelledby="feedback-title">
        <h1 id="feedback-title">Field Notes</h1>
        <p>Small signals from thoughtful AI work. Patterns we keep seeing when builders slow down just enough to make the next decision traceable.</p>
      </section>
      <section className="new-field-note-grid" aria-label="Field notes">
        {fieldNotes.map(([title, summary, category], index) => (
          <article className="new-field-note" key={title}>
            <div className={`field-note-image-placeholder placeholder-${index + 1}`}>
               <span className="placeholder-number">0{index + 1}</span>
            </div>
            <div className="field-note-content">
              <h3>{title}</h3>
              <p>{summary}</p>
              <span className="field-note-date">{category}</span>
            </div>
          </article>
        ))}
      </section>
      <PublicFooter />
    </MarketingPage>
  );
}

export function MarketingContactPage() {
  return (
    <MarketingPage className="marketing-contact new-marketing-contact">
      <div className="contact-split-layout">
        <div className="contact-left-pane">
           <Link aria-label="GenPHD home" className="brand contact-brand" href="/">
             <span className="brand-mark">G</span>
           </Link>
           
           <div className="vertical-text-nav">
             <span className="active">Connect</span>
             <span>Support</span>
             <span>Ideas</span>
           </div>
           
           <div className="contact-socials">
             <span>GH</span>
             <span>TW</span>
             <span>LI</span>
           </div>
        </div>
        <div className="contact-right-pane">
           <div className="contact-form-card">
             <p className="eyebrow">Contact GenPHD</p>
             <h1 id="contact-title">Bring us the question<br/>you are working through.</h1>
             <p>Share product feedback, a support need, or an idea that would make GenPHD more useful for your next build.</p>
             
             <div className="contact-action-box">
                <div className="step-indicator">
                  <span>1</span> <span className="dash">—</span> <span>5</span>
                </div>
                <a className="button button-primary huge-btn" href="https://github.com/ankitpt2005/GenPHD/issues" rel="noreferrer" target="_blank">Open project support <ArrowUpRight size={16} /></a>
             </div>
             <p className="contact-note"><ShieldCheck aria-hidden="true" size={15} /> Please do not include passwords or API keys in public issues.</p>
           </div>
           <div className="contact-overlay-art"></div>
        </div>
      </div>
    </MarketingPage>
  );
}
