import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Page Not Found | Techsara" },
  robots: { index: false, follow: true },
};

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/solutions", label: "Solutions" },
  { href: "/articles", label: "Articles" },
  { href: "/contact", label: "Contact" },
  { href: "/book", label: "Book a Consultation" },
];

export default function NotFound() {
  return (
    <main className="trends-page solutions-page">
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

      <section className="notfound">
        <div className="container notfound-inner">
          <p className="notfound-code" aria-hidden="true">404</p>
          <h1>This page took an unexpected detour.</h1>
          <p className="notfound-sub">
            The page you&apos;re looking for has moved or never existed. Let&apos;s get you back on
            track - here are a few good places to start.
          </p>
          <div className="notfound-links">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="notfound-link">
                {link.label}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer" id="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="brand" aria-label="Techsara home">
                <span className="brand-mark" aria-hidden="true">
                  <img src="/assets/techsara-logo.webp" alt="Techsara" className="brand-logo" width={48} height={48} />
                </span>
                TECHSARA
              </Link>
              <Link href="/book" className="btn btn-primary footer-cta">
                Book a consultation
                <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li><Link href="/solutions/generative-ai">Generative AI / LLMs</Link></li>
                <li><Link href="/solutions/computer-vision">Computer Vision</Link></li>
                <li><Link href="/solutions/nlp">NLP &amp; Speech</Link></li>
                <li><Link href="/solutions/predictive-ml">Predictive ML</Link></li>
                <li><Link href="/solutions/mlops">MLOps</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><Link href="/services/talent">Talent Solutions</Link></li>
                <li><Link href="/services/team">Team Solutions</Link></li>
                <li><Link href="/services/project">Project Solutions</Link></li>
                <li><Link href="/services/international">International Talent Solutions</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:hello@techsarasolutions.com?cc=sales@techsarasolutions.com">hello@techsarasolutions.com</a></li>
                <li><a href="tel:3234866123">(323) 486-6123</a></li>
                <li>Frisco, TX · USA</li>
                <li><Link href="/contact">Contact us</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; 2026 Techsara Solutions, Inc. All rights reserved.</div>
            <div className="footer-socials">
              <a href="https://www.linkedin.com/company/techsara-solutions/about" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
