"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContactForm from "@/components/ContactForm";

export default function ContactPageClient() {
  const [isOverHero, setIsOverHero] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMobileOpen]);

  useEffect(() => {
    const updateNavTheme = () => {
      const hero = document.querySelector(".contact-hero");
      if (!hero) return;
      setIsOverHero(hero.getBoundingClientRect().bottom > 120);
    };
    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme);
    updateNavTheme();
    return () => {
      window.removeEventListener("scroll", updateNavTheme);
      window.removeEventListener("resize", updateNavTheme);
    };
  }, []);

  return (
    <main className="trends-page solutions-page">
      <header className={`nav trends-nav is-ready ${isOverHero ? "over-dark" : "is-scrolled"}${isMobileOpen ? " is-mobile-open" : ""}`} role="banner">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Techsara home">
            <span className="brand-mark" aria-hidden="true">
              <img src="/assets/techsara-logo.webp" alt="Techsara" className="brand-logo" width={48} height={48} />
            </span>
            TECHSARA
          </Link>
          <nav className="nav-links" aria-label="Primary" id="primary-nav-links">
            <div className="nav-item-dropdown">
              <Link href="/services" className="nav-dropdown-trigger" onClick={() => setIsMobileOpen(false)}>
                Services
                <svg className="nav-dropdown-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div className="nav-dropdown-panel" role="menu">
                <Link href="/services/talent" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">Talent Solutions</span>
                  <span className="nav-dropdown-desc">Connecting you with the best talent in the marketplace</span>
                </Link>
                <Link href="/services/team" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">Team Solutions</span>
                  <span className="nav-dropdown-desc">Stay involved with valued initiatives; we handle the details</span>
                </Link>
                <Link href="/services/project" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">Project Solutions</span>
                  <span className="nav-dropdown-desc">We&apos;ll manage your project&apos;s outcome from start to finish</span>
                </Link>
                <Link href="/services/international" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">International Talent Solutions</span>
                  <span className="nav-dropdown-desc">Sourcing global talent to solve your workforce challenges</span>
                </Link>
              </div>
            </div>
            <div className="nav-item-dropdown">
              <Link href="/solutions" className="nav-dropdown-trigger" onClick={() => setIsMobileOpen(false)}>
                Solutions
                <svg className="nav-dropdown-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div className="nav-dropdown-panel" role="menu">
                <Link href="/solutions/generative-ai" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">Generative AI</span>
                  <span className="nav-dropdown-desc">LLMs, RAG and fine-tuning grounded in your data</span>
                </Link>
                <Link href="/solutions/computer-vision" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">Computer Vision</span>
                  <span className="nav-dropdown-desc">Real-time detection, defect inspection and edge optimization</span>
                </Link>
                <Link href="/solutions/ai-agents" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">Agents</span>
                  <span className="nav-dropdown-desc">Tool-using workflow agents with human-in-the-loop gates</span>
                </Link>
                <Link href="/solutions/cloud-deployment" className="nav-dropdown-link" role="menuitem" onClick={() => setIsMobileOpen(false)}>
                  <span className="nav-dropdown-title">Cloud Deployment</span>
                  <span className="nav-dropdown-desc">Reference architectures, FinOps and observability</span>
                </Link>
              </div>
            </div>
            <Link href="/articles" onClick={() => setIsMobileOpen(false)}>Articles</Link>
            <Link href="/careers" onClick={() => setIsMobileOpen(false)}>Careers</Link>
            <Link href="/contact" onClick={() => setIsMobileOpen(false)}>Contact</Link>
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

      <section className="contact-hero">
        <div className="contact-hero-overlay" aria-hidden="true" />
        <div className="container contact-hero-inner">
          <p className="contact-hero-eyebrow">Contact</p>
          <h1>Contact Techsara</h1>
          <p className="contact-hero-sub">
            Talk to our team in Frisco, Texas about AI development, IT staffing and cloud
            solutions for your enterprise. We reply to every message the same business day.
          </p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container contact-grid">
          <aside className="contact-info" aria-label="Techsara contact details">
            <h2>Get in touch</h2>
            <p className="contact-info-lead">
              Prefer to call or email directly? Reach us using the details below, or send the
              form and a senior Techsara lead will follow up.
            </p>

            <ul className="contact-info-list">
              <li className="contact-info-item">
                <span className="contact-info-label">Office</span>
                <address className="contact-info-value">
                  Frisco, TX 75034<br />
                  United States
                </address>
              </li>
              <li className="contact-info-item">
                <span className="contact-info-label">Phone</span>
                <span className="contact-info-value">
                  <a href="tel:+13235961938">+1 (323) 596-1938</a>
                </span>
              </li>
              <li className="contact-info-item">
                <span className="contact-info-label">Email</span>
                <span className="contact-info-value">
                  <a href="mailto:hello@techsarasolutions.com?cc=sales@techsarasolutions.com">hello@techsarasolutions.com</a>
                </span>
              </li>
              <li className="contact-info-item">
                <span className="contact-info-label">Hours</span>
                <span className="contact-info-value">Mon–Fri, 8:00 AM–6:00 PM CST</span>
              </li>
            </ul>

            <Link href="/book" className="btn btn-primary contact-info-cta">
              Book a free consultation
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </aside>

          <div className="cta-form-card contact-form-card">
            <header className="cta-form-card-head">
              <h2>Send us a message</h2>
              <p>Tell us a bit about your initiative — a Techsara lead replies within one business day.</p>
            </header>
            <ContactForm variant="inline" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
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
              <li><a href="tel:+13235961938">(323) 596-1938</a></li>
              <li>Frisco, TX · USA</li>
              <li><Link href="/book">Book a call</Link></li>
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
  );
}
