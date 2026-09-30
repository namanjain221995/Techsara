"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Static, SSR-friendly site header for the blog. Mirrors the primary navigation used
 * elsewhere on the site (Services / Solutions / Articles / Careers / Contact). The blog
 * is intentionally NOT linked here - it stays out of the visible nav while remaining a
 * fully crawlable, indexable page.
 *
 * The mobile toggle mirrors the one in ContactPageClient / TrendsPageClient: below the
 * nav breakpoint `.nav-links` is display:none until `is-mobile-open` is set on the header.
 * Without this button those links are unreachable on a phone.
 */
export default function SiteHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMobileOpen]);

  const close = () => setIsMobileOpen(false);

  return (
    <header
      className={`nav trends-nav is-ready is-scrolled${isMobileOpen ? " is-mobile-open" : ""}`}
      role="banner"
    >
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Techsara home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/assets/techsara-logo.webp" alt="Techsara" className="brand-logo" width={48} height={48} />
          </span>
          TECHSARA
        </Link>
        <nav className="nav-links" aria-label="Primary" id="primary-nav-links">
          <div className="nav-item-dropdown">
            <Link href="/services" className="nav-dropdown-trigger" onClick={close}>
              Services
              <svg className="nav-dropdown-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="nav-dropdown-panel" role="menu">
              <Link href="/services/generative-ai" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">Generative AI</span>
                <span className="nav-dropdown-desc">LLMs, RAG and fine-tuning grounded in your data</span>
              </Link>
              <Link href="/services/computer-vision" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">Computer Vision</span>
                <span className="nav-dropdown-desc">Real-time detection, defect inspection and edge optimization</span>
              </Link>
              <Link href="/services/ai-agents" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">Agents</span>
                <span className="nav-dropdown-desc">Tool-using workflow agents with human-in-the-loop gates</span>
              </Link>
              <Link href="/services/cloud-deployment" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">Cloud Deployment</span>
                <span className="nav-dropdown-desc">Reference architectures, FinOps and observability</span>
              </Link>
            </div>
          </div>
          <div className="nav-item-dropdown">
            <Link href="/solutions" className="nav-dropdown-trigger" onClick={close}>
              Solutions
              <svg className="nav-dropdown-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="nav-dropdown-panel" role="menu">
              <Link href="/solutions/talent" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">Talent Solutions</span>
                <span className="nav-dropdown-desc">Connecting you with the best talent in the marketplace</span>
              </Link>
              <Link href="/solutions/team" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">Team Solutions</span>
                <span className="nav-dropdown-desc">Stay involved with valued initiatives; we handle the details</span>
              </Link>
              <Link href="/solutions/project" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">Project Solutions</span>
                <span className="nav-dropdown-desc">We&apos;ll manage your project&apos;s outcome from start to finish</span>
              </Link>
              <Link href="/solutions/international" className="nav-dropdown-link" role="menuitem" onClick={close}>
                <span className="nav-dropdown-title">International Talent Solutions</span>
                <span className="nav-dropdown-desc">Sourcing global talent to solve your workforce challenges</span>
              </Link>
            </div>
          </div>
          <Link href="/articles" onClick={close}>Articles</Link>
          <Link href="/careers" onClick={close}>Careers</Link>
          <Link href="/about" onClick={close}>About</Link>
        </nav>
        <div className="nav-actions">
          <Link href="/book" className="btn btn-primary">
            Book a Consultation
            <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
            aria-controls="primary-nav-links"
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            <svg className="nav-toggle-icon-open" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <svg className="nav-toggle-icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
