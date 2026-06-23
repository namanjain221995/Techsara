import Link from "next/link";

/**
 * Static, SSR-friendly site header for the blog. Mirrors the primary navigation used
 * elsewhere on the site (Services / Solutions / Articles / Careers / Contact). The blog
 * is intentionally NOT linked here — it stays out of the visible nav while remaining a
 * fully crawlable, indexable page.
 */
export default function SiteHeader() {
  return (
    <header className="nav trends-nav is-ready is-scrolled" role="banner">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Techsara home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/assets/techsara-logo.webp" alt="Techsara" className="brand-logo" width={48} height={48} />
          </span>
          TECHSARA
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/services">Services</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="nav-actions">
          <Link href="/book" className="btn btn-primary">
            Book a Consultation
            <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
