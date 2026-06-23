"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ContactModal from "@/components/ContactModal";
import { useSwipe } from "@/lib/useSwipe";

const slides = [
  {
    id: "talent",
    title: "Talent Solutions",
    description:
      "Save time finding the right resource for your team while we connect you with the best talent in the marketplace.",
    cta: "Learn More",
    href: "/services/talent",
    image: "/uploads/hero_1.webp",
  },
  {
    id: "team",
    title: "Team Solutions",
    description:
      "Take charge of your most valued initiatives while we provide a dedicated team offering technical expertise and services.",
    cta: "Learn More",
    href: "/services/team",
    image: "/uploads/hero_2.webp",
  },
  {
    id: "project",
    title: "Project Solutions",
    description:
      "Transform your business while we help you connect strategy to execution to tackle your most challenging initiatives.",
    cta: "Learn More",
    href: "/services/project",
    image: "/uploads/hero_3.webp",
  },
  {
    id: "global",
    title: "International Talent Solutions",
    description:
      "Connect with the specialized onshore talent you need while we provide risk mitigation, immigration strategy and visa sponsorship.",
    cta: "Learn More",
    href: "/services/international",
    image: "/uploads/hero_4.webp",
  },
];

export default function SolutionsPageClient() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOverHero, setIsOverHero] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const carouselRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMobileOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateNavTheme = () => {
      const hero = document.querySelector(".solutions-hero");
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

  function goTo(index: number) {
    setActiveIndex(index);
  }

  function goPrev() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  useSwipe(carouselRef, { onSwipeLeft: goNext, onSwipeRight: goPrev });

  return (
    <main className="trends-page solutions-page">
      {/* Single, stable page H1 (the carousel titles are decorative H2s that rotate). */}
      <h1 className="sr-only">IT Staffing &amp; AI Talent Services</h1>
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
            {/* <Link href="/#cases">Leadership</Link> */}
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

      <section
        ref={carouselRef}
        className="trends-carousel solutions-hero"
        aria-label="Featured solutions"
      >
        <div className="trends-carousel-track">
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className={`trends-slide solutions-slide${index === activeIndex ? " is-active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
              aria-hidden={index === activeIndex ? "false" : "true"}
            >
              <div className="trends-slide-overlay" aria-hidden="true" />
              <div className="container trends-slide-inner solutions-slide-inner">
                <h2>{slide.title}</h2>
                <p className="solutions-slide-desc">{slide.description}</p>
                <Link href={slide.href} className="solutions-slide-link">
                  {slide.cta}
                  <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
                    <path
                      d="M1 5h18M14 1l5 4-5 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <button type="button" className="trends-arrow trends-arrow-left" onClick={goPrev} aria-label="Previous solution">
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" className="trends-arrow trends-arrow-right" onClick={goNext} aria-label="Next solution">
          <span aria-hidden="true">›</span>
        </button>

        <div className="trends-dots" role="tablist" aria-label="Solution slides">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`trends-dot${index === activeIndex ? " is-active" : ""}`}
              onClick={() => goTo(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-selected={index === activeIndex}
            />
          ))}
        </div>
      </section>

      <SpecialtiesSection />
      <GlobalNetworkSection />
      <Footer />
    </main>
  );
}

const specialties = [
  {
    id: "technology",
    title: "Technology",
    description:
      "Techsara knows the evolution of technology requires the ability to adapt and break barriers. Our custom AI solutions put you on the cutting edge of engineering, product development, data analytics and automation. Learn how our industry specialists can help you achieve powerful results in digital transformation.",
  },
  {
    id: "financial",
    title: "Financial Services",
    description:
      "The Financial Services industry is rapidly transforming and evolving. From mobile banking initiatives to cloud migrations, large-scale data projects and core systems implementations, Techsara partners with banking and FinTech leaders to improve customer experience, product innovation, regulatory compliance and growth at scale.",
  },
  {
    id: "communications",
    title: "Communications",
    description:
      "Now, more than ever, specialized capability is needed to address the rising consumer demand for faster connections and on-demand content. From wireless operations and telecom services to entertainment and advertising, our team of industry experts keeps your customers connected - at home, at work or on the go - with cutting-edge solutions built for today's digital world.",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description:
      "Like Techsara, helping people is the heart of your business. Our team of industry-leading AI experts deliver strategic, regulation-aware solutions to your most impactful initiatives. From healthcare payers and providers to life sciences and medical devices, we know the solutions you need are as varied as the industry you serve - purposeful, scalable and customized to fit your business.",
  },
  {
    id: "insurance",
    title: "Insurance",
    description:
      "Today's technology and workforce innovations can enable sustained growth and streamlined process while improving customer experience. We help you deliver tomorrow's insurance solutions by optimizing transformation leadership, domain operations, customer engagement, data & applied AI and technology services - so you can find the specialized capability and integrate the technology you need to transform your business.",
  },
];

function SpecialtiesSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section id="our-specialties" className="solutions-specialties">
      <div className="container solutions-specialties-inner">
        <header className="solutions-specialties-head">
          <h2>Our Specialties</h2>
          <p>
            Whether you&apos;re looking for a consultant to provide expert guidance on an existing
            AI project or seeking a complete managed outcome on a transformational initiative,
            we&apos;re here with solutions that support your business and vision - no matter
            the size.
          </p>
          <p>
            We believe only an expert can provide the best business solutions for you. That&apos;s
            why our team works to understand the intricacies, challenges and pain points that drive
            your industry. With deep AI engineering expertise across regulated, capital-intensive
            sectors, we&apos;ll do what it takes to help you gain a competitive edge.
          </p>
          <p>
            Together, we can achieve powerful results.{" "}
            <button
              type="button"
              className="solutions-specialties-link"
              onClick={() => setIsContactOpen(true)}
            >
              Contact us
            </button>{" "}
            today to start a conversation.
          </p>
        </header>

        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

        <div className="solutions-specialties-list" role="list">
          {specialties.map((specialty) => {
            const isOpen = openId === specialty.id;
            return (
              <article
                key={specialty.id}
                className={`specialty-card${isOpen ? " is-open" : ""}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="specialty-card-toggle"
                  aria-expanded={isOpen}
                  aria-controls={`specialty-body-${specialty.id}`}
                  onClick={() => toggle(specialty.id)}
                >
                  <span className="specialty-card-title">{specialty.title}</span>
                  <span className="specialty-card-icon" aria-hidden="true">
                    {isOpen ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </button>
                <div
                  id={`specialty-body-${specialty.id}`}
                  className="specialty-card-body"
                  role="region"
                  aria-labelledby={`specialty-toggle-${specialty.id}`}
                >
                  <div className="specialty-card-body-inner">
                    <p>{specialty.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GlobalNetworkSection() {
  return (
    <section id="solution-global" className="solutions-global">
      <div className="container solutions-global-inner">
        <div className="solutions-global-visual">
          <img
            className="solutions-global-map"
            src="/uploads/map.webp"
            alt=""
            aria-hidden="true"
          />

          <span
            className="solutions-global-avatar solutions-global-avatar-1"
            style={{ backgroundImage: "url('/uploads/hero_1.webp')" }}
            aria-hidden="true"
          />
          <span
            className="solutions-global-avatar solutions-global-avatar-2"
            style={{ backgroundImage: "url('/uploads/hero_2.webp')" }}
            aria-hidden="true"
          />
          <span
            className="solutions-global-avatar solutions-global-avatar-3"
            style={{ backgroundImage: "url('/uploads/hero_4.webp')" }}
            aria-hidden="true"
          />

          <span className="solutions-global-ping solutions-global-ping-1" aria-hidden="true" />
          <span className="solutions-global-ping solutions-global-ping-2" aria-hidden="true" />
          <span className="solutions-global-ping solutions-global-ping-3" aria-hidden="true" />
        </div>

        <div className="solutions-global-content">
          <h2>International Talent Solutions</h2>
          <p>
            You need specialized talent. We have the network. Let us connect you with top
            global talent to ensure your business solutions enhance your business strategy.
          </p>
        </div>
      </div>
    </section>
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
              <li><Link href="/solutions/cloud-deployment">Cloud Deployment</Link></li>
              <li><Link href="/solutions/on-premise">On-Premise AI</Link></li>
              <li><Link href="/solutions/hybrid-edge">Hybrid &amp; Edge</Link></li>
              <li><Link href="/solutions/ai-strategy">AI Strategy</Link></li>
              <li><Link href="/solutions/cloud-consulting">Cloud Consulting</Link></li>
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
