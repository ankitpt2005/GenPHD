import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const decisionLoop = [
  ["Project context", "Name the goal, constraints, and the blocker that matters now."],
  ["Decision Brief", "Inspect evidence, tradeoffs, uncertainty, and one practical recommendation."],
  ["Build evidence", "Complete a focused mission and use the outcome to update what comes next."],
] as const;

export function LandingPage() {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <Link aria-label="GenPHD home" className="brand landing-brand" href="/">
          <span className="brand-mark">G</span>
          <span className="brand-name">GenPHD</span>
        </Link>
        <Link className="button button-secondary" href="/login">Sign in</Link>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <p className="eyebrow">Decision intelligence for AI engineers</p>
        <h1 id="landing-title">Turn conflicting AI advice into the right next build action.</h1>
        <p>GenPHD keeps your project constraints, evidence, technical decisions, and practical outcomes in one calm workspace.</p>
        <div className="landing-actions">
          <Link className="button button-primary" href="/onboarding">Start your first decision <ArrowRight size={16} /></Link>
          <a className="button button-ghost" href="#decision-loop">See how it works</a>
        </div>
      </section>

      <section className="decision-loop" id="decision-loop" aria-labelledby="decision-loop-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The decision loop</p>
            <h2 id="decision-loop-title">One project. One useful next move.</h2>
          </div>
        </div>
        <ol className="landing-loop-list">
          {decisionLoop.map(([title, detail], index) => (
            <li key={title}>
              <span className="landing-loop-index">0{index + 1}</span>
              <div><h3>{title}</h3><p>{detail}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <p className="landing-trust"><Check aria-hidden="true" size={16} /> Recommendations show evidence and uncertainty. Your workspace stays under your control.</p>
    </main>
  );
}
