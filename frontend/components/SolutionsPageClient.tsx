"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContactModal from "@/components/ContactModal";

const slides = [
  {
    id: "talent",
    title: "Talent Solutions",
    description:
      "Save time finding the right resource for your team while we connect you with the best talent in the marketplace.",
    cta: "Learn More",
    href: "/solutions/talent",
    image: "/uploads/hero_1.jpg",
  },
  {
    id: "team",
    title: "Team Solutions",
    description:
      "Take charge of your most valued initiatives while we provide a dedicated team offering technical expertise and services.",
    cta: "Learn More",
    href: "/solutions/team",
    image: "/uploads/hero_2.jpg",
  },
  {
    id: "project",
    title: "Project Solutions",
    description:
      "Transform your business while we help you connect strategy to execution to tackle your most challenging initiatives.",
    cta: "Learn More",
    href: "/solutions/project",
    image: "/uploads/hero_3.jpg",
  },
  {
    id: "global",
    title: "International Talent Solutions",
    description:
      "Connect with the specialized onshore talent you need while we provide risk mitigation, immigration strategy and visa sponsorship.",
    cta: "Learn More",
    href: "/solutions/international",
    image: "/uploads/hero_4.png",
  },
];

export default function SolutionsPageClient() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOverHero, setIsOverHero] = useState(true);

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

  return (
    <main className="trends-page solutions-page">
      <header className={`nav trends-nav is-ready ${isOverHero ? "over-dark" : "is-scrolled"}`} role="banner">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Techsara home">
            <span className="brand-mark" aria-hidden="true">
              <img src="/assets/techsara-logo.png" alt="" className="brand-logo" />
            </span>
            TECHSARA
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <Link href="/#services">Services</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/#industries">Industries</Link>
            <Link href="/#cases">Case Studies</Link>
            <Link href="/trends">Trends</Link>
            <Link href="/#contact">Contact</Link>
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

      <section className="trends-carousel solutions-hero" aria-label="Featured solutions">
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
                <h1>{slide.title}</h1>
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
      "Now, more than ever, specialized capability is needed to address the rising consumer demand for faster connections and on-demand content. From wireless operations and telecom services to entertainment and advertising, our team of industry experts keeps your customers connected — at home, at work or on the go — with cutting-edge solutions built for today's digital world.",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description:
      "Like Techsara, helping people is the heart of your business. Our team of industry-leading AI experts deliver strategic, regulation-aware solutions to your most impactful initiatives. From healthcare payers and providers to life sciences and medical devices, we know the solutions you need are as varied as the industry you serve — purposeful, scalable and customized to fit your business.",
  },
  {
    id: "insurance",
    title: "Insurance",
    description:
      "Today's technology and workforce innovations can enable sustained growth and streamlined process while improving customer experience. We help you deliver tomorrow's insurance solutions by optimizing transformation leadership, domain operations, customer engagement, data & applied AI and technology services — so you can find the specialized capability and integrate the technology you need to transform your business.",
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
            we&apos;re here with solutions that support your business and vision&mdash;no matter
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
            src="/uploads/map.png"
            alt=""
            aria-hidden="true"
          />

          <span
            className="solutions-global-avatar solutions-global-avatar-1"
            style={{ backgroundImage: "url('/uploads/hero_1.jpg')" }}
            aria-hidden="true"
          />
          <span
            className="solutions-global-avatar solutions-global-avatar-2"
            style={{ backgroundImage: "url('/uploads/hero_2.jpg')" }}
            aria-hidden="true"
          />
          <span
            className="solutions-global-avatar solutions-global-avatar-3"
            style={{ backgroundImage: "url('/uploads/hero_4.png')" }}
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
                <img src="/assets/techsara-logo.png" alt="" className="brand-logo" />
              </span>
              TECHSARA
            </Link>
            <p>
              End-to-end AI development, cloud &amp; on-premise deployment, and strategic
              consulting engineered for enterprise outcomes.
            </p>
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
              <li><Link href="/services/cloud-deployment">Cloud Deployment</Link></li>
              <li><Link href="/services/on-premise">On-Premise AI</Link></li>
              <li><Link href="/services/hybrid-edge">Hybrid &amp; Edge</Link></li>
              <li><Link href="/services/ai-strategy">AI Strategy</Link></li>
              <li><Link href="/services/cloud-consulting">Cloud Consulting</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@techsara.io">hello@techsara.io</a></li>
              <li><a href="tel:+14155550140">+1 (415) 555-0140</a></li>
              <li>San Francisco / Dubai / Bangalore</li>
              <li><Link href="/book">Book a call</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 Techsara Solutions, Inc. All rights reserved.</div>
          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </a>
            <a href="#" aria-label="X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h3l-7.5 8.6L22 22h-6.8l-5.3-6.9L3.8 22H1l8-9.2L1 2h7l4.7 6.3L18 2z" />
              </svg>
            </a>
            <a href="#" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 015.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.73.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 7s-.2-1.6-.8-2.3c-.8-.9-1.8-.9-2.2-1C16.9 3.3 12 3.3 12 3.3s-4.9 0-8 .4c-.4.1-1.4.1-2.2 1C1.2 5.4 1 7 1 7S.8 8.9.8 10.8v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.8.2 7.8.3 7.8.3s4.9 0 8-.4c.4-.1 1.4-.1 2.2-1 .6-.7.8-2.3.8-2.3s.2-1.9.2-3.8v-1.4C23.2 8.9 23 7 23 7zM9.7 14.6V8.4l6.4 3.1-6.4 3.1z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
