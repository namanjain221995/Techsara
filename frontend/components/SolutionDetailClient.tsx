"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContactModal from "@/components/ContactModal";
import type { SolutionDetail } from "@/components/solution-details-data";

export default function SolutionDetailClient({ data }: { data: SolutionDetail }) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);

  useEffect(() => {
    const updateNavTheme = () => {
      const hero = document.querySelector(".solution-detail-hero");
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
      <header className={`nav trends-nav is-ready ${isOverHero ? "over-dark" : "is-scrolled"}`} role="banner">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Techsara home">
            <span className="brand-mark" aria-hidden="true">
              <img src="/assets/techsara-logo.png" alt="" className="brand-logo" />
            </span>
            TECHSARA
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <Link href="/services">Services</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/#industries">Industries</Link>
            {/* <Link href="/#cases">Leadership</Link> */}
            <Link href="/careers">Careers</Link>
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

      <section
        className="solution-detail-hero"
        style={{ backgroundImage: `url(${data.heroImage})` }}
        aria-label={data.title}
      >
        <div className="solution-detail-hero-overlay" aria-hidden="true" />
        <div className="container solution-detail-hero-inner">
          <h1>{data.title}</h1>
          <button
            type="button"
            className="solution-detail-hero-cta"
            onClick={() => setIsContactOpen(true)}
          >
            Start a Conversation
          </button>
        </div>
      </section>

      {data.slug === "talent" && <TalentNetworkSection />}
      {data.slug === "team" && <TeamSolutionsSection />}
      {data.slug === "project" && <ProjectSolutionsSection />}
      {data.slug === "international" && <InternationalSolutionsSection />}

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        defaultTopic={data.defaultTopic}
      />
      <Footer />
    </main>
  );
}

function TalentNetworkSection() {
  const cx = 260;
  const cy = 150;
  const rOuter = 170;
  const rInner = 82;
  const centerR = 64;
  const labelArcR = 146;
  const iconArcR = 116;
  const gap = 2.5;

  const polar = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcSegment = (startDeg: number, endDeg: number) => {
    const p1 = polar(startDeg, rOuter);
    const p2 = polar(endDeg, rOuter);
    const p3 = polar(endDeg, rInner);
    const p4 = polar(startDeg, rInner);
    return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 0 0 ${p4.x} ${p4.y} Z`;
  };

  const labelPath = (startDeg: number, endDeg: number, sweepFlag: 0 | 1) => {
    const p1 = polar(startDeg, labelArcR);
    const p2 = polar(endDeg, labelArcR);
    return `M ${p1.x} ${p1.y} A ${labelArcR} ${labelArcR} 0 0 ${sweepFlag} ${p2.x} ${p2.y}`;
  };

  // All three labels are written so the characters' tops point outward
  // (away from the center).
  // Left arc — reads top→bottom going down the left segment.
  const contractLabelPath = labelPath(178, 122, 0);
  // Bottom arc — reads left→right along the bottom segment.
  const c2hLabelPath = labelPath(122, 58, 0);
  // Right arc — reads bottom→top going up the right segment.
  const directLabelPath = labelPath(58, 2, 0);

  const directIcon = polar(30, iconArcR);
  const c2hIcon = polar(90, iconArcR);
  const contractIcon = polar(150, iconArcR);

  return (
    <section className="talent-network">
      <div className="container talent-network-inner">
        <div className="talent-network-text">
          <h2>Connecting you with a wide network of professionals</h2>
          <p>
            Whether you need an individual to fill a short-term vacancy or a direct hire,
            Techsara&apos;s Talent Solutions services will connect you with a wide network of
            professionals in the AI engineering, ML and data spaces.
          </p>
          <p>
            Our focus is finding employment solutions and consulting opportunities to solve
            business challenges for a variety of industries. Our streamlined hiring process
            and ongoing consultant care will help you find and support the right talent to fit
            your needs, so you can focus on managing your team.
          </p>
        </div>

        <div className="talent-network-visual">
          <svg
            viewBox="0 0 520 360"
            className="talent-fan"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <path id="contract-label-path" d={contractLabelPath} />
              <path id="c2h-label-path" d={c2hLabelPath} />
              <path id="direct-label-path" d={directLabelPath} />
              <filter id="fan-shadow" x="-20%" y="-20%" width="140%" height="160%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
                <feOffset dx="0" dy="6" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.22" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="contract-grad" cx="50%" cy="100%" r="120%">
                <stop offset="0%" stopColor="#1a5a9a" />
                <stop offset="100%" stopColor="#0d3a6e" />
              </radialGradient>
              <radialGradient id="c2h-grad" cx="50%" cy="100%" r="120%">
                <stop offset="0%" stopColor="#3aaba9" />
                <stop offset="100%" stopColor="#1f7d7d" />
              </radialGradient>
              <radialGradient id="direct-grad" cx="50%" cy="100%" r="120%">
                <stop offset="0%" stopColor="#5cb6df" />
                <stop offset="100%" stopColor="#2d99cf" />
              </radialGradient>
            </defs>

            {/* Three colored segments with subtle radial gradients + elevation shadow */}
            <g filter="url(#fan-shadow)">
              <path d={arcSegment(120 + gap, 180 - gap)} fill="url(#contract-grad)" className="fan-segment" />
              <path d={arcSegment(60 + gap, 120 - gap)} fill="url(#c2h-grad)" className="fan-segment" />
              <path d={arcSegment(0 + gap, 60 - gap)} fill="url(#direct-grad)" className="fan-segment" />
            </g>

            {/* Curved labels following the outer arcs */}
            <text className="fan-label">
              <textPath
                href="#contract-label-path"
                startOffset="50%"
                textAnchor="middle"
              >
                Contract
              </textPath>
            </text>
            <text className="fan-label">
              <textPath
                href="#c2h-label-path"
                startOffset="50%"
                textAnchor="middle"
              >
                Contract-to-hire
              </textPath>
            </text>
            <text className="fan-label">
              <textPath
                href="#direct-label-path"
                startOffset="50%"
                textAnchor="middle"
              >
                Direct hire
              </textPath>
            </text>

            {/* Icons sit near the inner edge of each segment */}
            {/* Gear (Contract) — 8 trapezoidal teeth + solid hub */}
            <g transform={`translate(${contractIcon.x}, ${contractIcon.y})`}>
              <g fill="#ffffff">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <rect
                    key={deg}
                    x="-1.8"
                    y="-11"
                    width="3.6"
                    height="4"
                    rx="0.5"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle r="7.5" />
                <circle r="2.8" fill="#1a5a9a" />
              </g>
            </g>

            {/* Document (Contract-to-hire) */}
            <g transform={`translate(${c2hIcon.x}, ${c2hIcon.y})`}>
              <g fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round">
                <path d="M -8 -11 L 4 -11 L 8 -7 L 8 11 L -8 11 Z" />
                <path d="M 4 -11 L 4 -7 L 8 -7" />
                <line x1="-4.5" y1="-3" x2="4.5" y2="-3" />
                <line x1="-4.5" y1="1" x2="4.5" y2="1" />
                <line x1="-4.5" y1="5" x2="2" y2="5" />
              </g>
            </g>

            {/* Handshake (Direct hire) — two clasping hand silhouettes */}
            <g transform={`translate(${directIcon.x}, ${directIcon.y})`}>
              <g fill="#ffffff" stroke="none">
                {/* Left forearm */}
                <path d="M -12 -3 L -5 -3 L -2 -1 L -5 -1 L -12 -1 Z" />
                {/* Left hand (palm + fingers wrapping right) */}
                <path d="M -5 -3 L -2 -1 L 0 0 L -2 1 L -5 3 L -5 -3 Z" />
                {/* Right forearm */}
                <path d="M 12 -3 L 5 -3 L 2 -1 L 5 -1 L 12 -1 Z" />
                {/* Right hand */}
                <path d="M 5 -3 L 2 -1 L 0 0 L 2 1 L 5 3 L 5 -3 Z" />
                {/* Lower forearms */}
                <path d="M -12 1 L -5 1 L -5 3 L -12 3 Z" />
                <path d="M 12 1 L 5 1 L 5 3 L 12 3 Z" />
              </g>
              {/* Clasp highlight */}
              <line
                x1="0"
                y1="-2.5"
                x2="0"
                y2="2.5"
                stroke="#2d99cf"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>

            {/* Center white circle */}
            <circle
              cx={cx}
              cy={cy}
              r={centerR}
              fill="#ffffff"
              stroke="#0c2545"
              strokeWidth="2.6"
              filter="url(#fan-shadow)"
            />

            {/* Center text */}
            <text x={cx} y={cy - 12} textAnchor="middle" className="fan-center-text">
              Techsara sources
            </text>
            <text x={cx} y={cy + 6} textAnchor="middle" className="fan-center-text">
              top talent for:
            </text>

            {/* Magnifier icon under center text */}
            <g transform={`translate(${cx}, ${cy + 30})`}>
              <circle r="7" fill="none" stroke="#0c2545" strokeWidth="1.9" />
              <line
                x1="5"
                y1="5"
                x2="10"
                y2="10"
                stroke="#0c2545"
                strokeWidth="2.3"
                strokeLinecap="round"
              />
            </g>
          </svg>

          <p className="talent-network-caption">
            Techsara sources top talent for contract, contract-to-hire and direct hire positions
            to meet your evolving staffing needs.
          </p>
        </div>
      </div>
    </section>
  );
}

function TeamSolutionsSection() {
  const focusAreas = [
    "Application Development",
    "Automation & Cloud",
    "Data and Analytics",
    "RPA and BPM Automation",
    "Digital Transformation",
    "Quality Assurance & Testing",
  ];

  return (
    <section className="team-solutions">
      <div className="container team-solutions-inner">
        <h2>Businesses rely on flexibility, creativity and innovation to drive results.</h2>
        <p>
          Built to put our deep AI engineering expertise and extensive specialist network at
          your fingertips, our custom Team Solutions allow you to transfer your talent
          acquisition and oversight duties to Techsara, while giving you the flexibility to
          maintain hands-on control over your project.
        </p>
        <p>
          Merging our AI expertise with your project management, a dedicated team of Techsara
          consultants provides technical expertise and services to help you achieve success.
          We help our customers attain high quality, predictable results for their most
          innovative AI projects, including:
        </p>
        <ul className="team-solutions-list">
          {focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
        <p>
          And we would love to help you achieve these same results for your projects. Designed
          to rapidly build, deploy and maintain teams of highly skilled AI professionals, our
          Team Solutions have proven to be a differentiator in today&apos;s competitive AI
          talent environment.
        </p>
        <p>
          We bridge the gap between business and technology to work seamlessly across
          industries and AI engineering disciplines.
        </p>
      </div>
    </section>
  );
}

function ProjectSolutionsSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const capabilities = [
    {
      id: "strategy",
      title: "Comprehensive Strategy",
      description:
        "Using a detailed and strategic approach, we work with stakeholders to assess current state, define objectives and project success markers and identify and tackle challenges early.",
    },
    {
      id: "application",
      title: "Application Enrichment",
      description:
        "Merging the perspectives of strategy and customer centricity, we help you identify and implement the best approach to deploy modern applications. Whether mobile, responsive, legacy, ATDD/TDD or APIs and microservices, we're fluent in modern development practices and achieve best-in-class customer experience without upending your operations.",
    },
    {
      id: "data",
      title: "Data & Analytics",
      description:
        "Knowing not one-size-fits-all, we help you understand where your data is coming from and the best methods for capturing, storing and making decisions from it, without overengineering or under-scaling the solution.",
    },
    {
      id: "automation",
      title: "Automation",
      description:
        "We approach automation from a human-first perspective. The goal is to reduce workload and free up the human potential inside of your organization. Our automation teams helps you establish an optimized culture for automation, governing the environment and tracking and realizing ROI to ensure outcomes meet expectations.",
    },
    {
      id: "design",
      title: "Digital & Customer Design",
      description:
        "In today's digital world, designing an engaging and impactful customer experience is essential. We merge creativity with technology to help you develop scalable, high-performing products that are user-centric and easy to use.",
    },
    {
      id: "pmo",
      title: "PMO",
      description:
        "Establishing a strong and process-driven PMO is vital for the success of any project. Our experts specialize in helping you define objectives, determine engagement models, implement tools and processes and collect, monitor and store key reporting data.",
    },
  ];

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <>
      <section className="project-intro">
        <div className="container project-intro-inner">
          <h2>
            Reimagining how business gets done with solutions that are creative, purposeful and
            scalable.
          </h2>
          <p>
            Uniting data-led strategy and streamlined execution, our Project Solutions give you
            the talent and support you need to actualize your most valuable and innovative
            projects. Bridge the talent and technology gap by partnering with our subject
            matter experts and leveraging Techsara&apos;s deep AI engineering expertise to
            transform your workforce.
          </p>
          <p>
            We specialize in helping our clients seamlessly integrate emerging solutions and
            tackle challenges with their most important initiatives.
          </p>
          <p>And we&apos;d love to help you, too.</p>
          <p>
            Our Project Solutions experts offer custom solutions that are powered by strategic
            and data-driven plans and processes to fit your business needs - no matter the
            size.
          </p>
        </div>
      </section>

      <section className="project-capabilities">
        <div className="container">
          <h2 className="project-capabilities-heading">Project Solutions Capabilities</h2>
          <div className="project-capabilities-list" role="list">
            {capabilities.map((cap) => {
              const isOpen = openId === cap.id;
              return (
                <article
                  key={cap.id}
                  className={`capability-card${isOpen ? " is-open" : ""}`}
                  role="listitem"
                >
                  <button
                    type="button"
                    className="capability-card-toggle"
                    aria-expanded={isOpen}
                    aria-controls={`capability-body-${cap.id}`}
                    onClick={() => toggle(cap.id)}
                  >
                    <span className="capability-card-title">{cap.title}</span>
                    <span className="capability-card-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                  <div
                    id={`capability-body-${cap.id}`}
                    className="capability-card-body"
                    role="region"
                  >
                    <div className="capability-card-body-inner">
                      <p>{cap.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function InternationalSolutionsSection() {
  return (
    <section className="international-solutions">
      <div className="container international-solutions-inner">
        <div className="international-solutions-text">
          <h2>
            Techsara Global Solutions<sup>®</sup> Ranks in the Top 1% for Visa Sponsorship in
            the U.S.
          </h2>
          <p>
            Our experts can help you find the specialized talent you need with our expansive
            onshore international network of global talent. As a trusted partner to our
            clients, we help bridge the talent gap - delivering solutions that enhance
            your business strategy.
          </p>

          <p className="international-list-heading">We specialize in:</p>
          <ul className="international-list">
            <li>Staffing and Solutions Services</li>
            <li>Resource Risk Assessment</li>
            <li>Advanced Resource Engagement</li>
            <li>Advisory Services</li>
          </ul>

          <p className="international-list-heading">We support:</p>
          <ul className="international-list">
            <li>H-1B Visas</li>
            <li>F1 Visas (Student Visas)</li>
            <li>STEM Optional Practical Training (OPT)</li>
            <li>Curricular Practical Training (CPT)</li>
            <li>Green Card (Permanent Resident Card) Holders</li>
          </ul>

        </div>

        <div className="international-solutions-visual">
          <img
            className="international-map"
            src="/uploads/map.png"
            alt=""
            aria-hidden="true"
          />

          <div className="international-stat international-stat-teal">
            <span className="international-stat-number">99%</span>
            <span className="international-stat-label">visa approval rating</span>
          </div>

          <div className="international-stat international-stat-navy international-stat-w2">
            <span className="international-stat-prefix">All consultants are</span>
            <span className="international-stat-w2-emphasis">W-2 employees</span>
            <span className="international-stat-suffix">of Techsara</span>
          </div>

          <div className="international-stat international-stat-navy international-stat-count">
            <span className="international-stat-number">38,000</span>
            <span className="international-stat-label">
              visa cases successfully processed
            </span>
          </div>
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
              <li><a href="tel:+13234866123">(323) 486-6123</a></li>
              <li>USA · 8668 John Hickman Pkwy, Suite 903<br/>Frisco, Texas 75034</li>
              
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
