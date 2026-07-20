import Link from "next/link";

export default function NotFound() {
  return <main className="not-found-shell"><section><p className="eyebrow">Not found</p><h1>This page is not available.</h1><p className="page-description">It may have moved, been removed, or be outside your workspace.</p><div className="landing-actions"><Link className="button button-primary" href="/dashboard">Go to dashboard</Link><Link className="button button-secondary" href="/contact">Get support</Link></div></section></main>;
}
