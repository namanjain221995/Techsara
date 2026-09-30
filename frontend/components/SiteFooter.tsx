import Link from "next/link";

/**
 * Static site footer used by the blog pages. Mirrors the sitewide footer markup so the
 * blog feels native to the rest of the site. The blog index is deliberately omitted from
 * the footer links to keep it out of the visible navigation.
 */
export default function SiteFooter() {
  return (
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
              <li><Link href="/services/generative-ai">Generative AI / LLMs</Link></li>
              <li><Link href="/services/computer-vision">Computer Vision</Link></li>
              <li><Link href="/services/nlp">NLP &amp; Speech</Link></li>
              <li><Link href="/services/predictive-ml">Predictive ML</Link></li>
              <li><Link href="/services/mlops">MLOps</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Solutions</h4>
            <ul>
              <li><Link href="/solutions/talent">Talent Solutions</Link></li>
              <li><Link href="/solutions/team">Team Solutions</Link></li>
              <li><Link href="/solutions/project">Project Solutions</Link></li>
              <li><Link href="/solutions/international">International Talent Solutions</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@techsarasolutions.com?cc=sales@techsarasolutions.com">hello@techsarasolutions.com</a></li>
              <li><a href="tel:3234866123">(323) 486-6123</a></li>
              <li>Frisco, TX · USA</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2021–2026 Techsara Solutions, Inc. All rights reserved. · <Link href="/privacy-policy" className="footer-legal-link">Privacy Policy</Link> · <Link href="/eula" className="footer-legal-link">EULA</Link></div>
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
  );
}
