"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContactModal from "@/components/ContactModal";
import type { SolutionDetail } from "@/components/solution-details-data";

export default function SolutionDetailClient({ data }: { data: SolutionDetail }) {
  const [isContactOpen, setIsContactOpen] = useState(false);
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

      {SERVICE_EXPANSIONS[data.slug] && (
        <ServiceExpansion content={SERVICE_EXPANSIONS[data.slug]} />
      )}

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
  // Left arc - reads top→bottom going down the left segment.
  const contractLabelPath = labelPath(178, 122, 0);
  // Bottom arc - reads left→right along the bottom segment.
  const c2hLabelPath = labelPath(122, 58, 0);
  // Right arc - reads bottom→top going up the right segment.
  const directLabelPath = labelPath(58, 2, 0);

  const directIcon = polar(30, iconArcR);
  const c2hIcon = polar(90, iconArcR);
  const contractIcon = polar(150, iconArcR);

  return (
    <section className="talent-network">
      <div className="container talent-network-inner">
        <div className="talent-network-text">
          <h2>Access a Pre-Vetted Network of AI, ML, and Data Engineering Professionals Built for Enterprise Demand.</h2>
          <p>
            As AI initiatives scale from pilot to production, the demand for highly
            specialised engineering talent such as LLM engineers, computer vision specialists,
            MLOps architects, data pipeline engineers, and cloud AI practitioners
            consistently outpaces what traditional hiring channels can deliver.
            Techsara&apos;s Talent Solutions bridges that gap with a deeply networked,
            rigorously vetted pool of professionals across the AI, ML, and data
            engineering disciplines.
          </p>
          <p>
            Techsara&apos;s engagement model is built for flexibility. Whether you need a
            single specialist to cover a critical short-term vacancy or a direct hire who
            will anchor a growing AI function, we scope, source, and match with precision.
            Our streamlined hiring process reduces time-to-placement without cutting
            corners on technical fit or cultural alignment.
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
            {/* Gear (Contract) - 8 trapezoidal teeth + solid hub */}
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

            {/* Handshake (Direct hire) - two clasping hand silhouettes */}
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
        <h2>Embedded AI and ML Engineering Teams, Scoped to Your Initiative and Accountable to Your Outcomes.</h2>
        <p>
          Scaling an AI initiative requires more than individual contributors. It demands a
          coordinated squad of specialists who understand how modern AI systems connect end to
          end. Techsara&apos;s Team Solutions gives you a fully assembled, dedicated engineering
          team spanning AI/ML engineers, MLOps practitioners, data engineers, cloud architects,
          and technical leads, scoped to your project and operating under your strategic
          direction.
        </p>
        <p>
          Techsara handles all talent acquisition, technical vetting, team composition, and
          ongoing oversight. Your leadership stays focused on product decisions and business
          outcomes, not recruitment pipelines. The team embeds directly into your workflow,
          aligns with your technical standards, and delivers consistently across your most
          complex AI initiatives, from LLM integration and model fine-tuning to MLOps
          infrastructure and production deployment.
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
            End-to-End AI Project Delivery, Managed to a Fixed Scope, Timeline, and Outcome so
            You Stay Focused on the Business.
          </h2>
          <p>
            High-stakes AI projects fail not from lack of ambition, but from lack of structured
            execution. Techsara&apos;s Project Solutions puts a single accountable partner in
            charge of your entire project lifecycle from stakeholder alignment and architecture
            scoping to build, QA, and production deployment on a defined scope, timeline, and
            budget.
          </p>
          <p>
            Our delivery teams bring deep AI engineering expertise across strategy, application
            development, data and analytics, automation, and PMO governance. We design
            execution plans calibrated to your business constraints, not generic templates so
            every milestone is tracked, every decision is data-driven, and the final outcome
            matches what was scoped from day one.
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
            Global AI and Engineering Talent, Onshore and Offshore with Visa Sponsorship,
            Immigration Strategy, and US Compliance Fully Managed.
          </h2>
          <p>
            Finding specialized AI and engineering talent within US borders is increasingly
            competitive. Techsara&apos;s International Talent Solutions expands your hiring reach
            globally connecting US enterprises with pre-vetted onshore and offshore specialists
            across AI engineering, cloud infrastructure, and data science, while Techsara
            carries the full weight of immigration strategy, visa sponsorship, and compliance.
          </p>
          <p>
            Ranked in the top 1% for visa sponsorship in the US and with over 38,000
            successfully processed visa cases, we manage H-1B, F-1/OPT, CPT, and green card
            engagements end to end. Every consultant is onboarded as a W-2 Techsara employee
            eliminating the legal and administrative overhead that makes global IT staffing
            complex. You define the technical requirements. We source the talent, handle the
            paperwork, and keep the engagement compliant.
          </p>

        </div>

        <div className="international-solutions-visual">
          <img
            className="international-map"
            src="/uploads/map.webp"
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

type ExpansionContent = {
  heading: string;
  intro: string;
  includes: string[];
  whoFor: string;
  industries: string[];
  steps: { title: string; desc: string }[];
  ctaText: string;
};

// Longer-form, keyword-aware copy for the otherwise-thin service detail pages.
// Naturally works in "IT staffing", "United States"/"US" and "Frisco, TX".
const SERVICE_EXPANSIONS: Record<string, ExpansionContent> = {
  talent: {
    heading: "IT staffing that puts the right engineer on your team",
    intro:
      "Talent Solutions is a specialist IT staffing service for US enterprises that need vetted engineering talent without a months-long search. From our base in Frisco, TX we recruit, screen and place AI, ML, data and platform engineers on contract, contract-to-hire and direct-hire terms - so you can scale your team to the work in front of you.",
    includes: [
      "Senior AI, ML, data and MLOps engineers, pre-vetted for your stack",
      "Contract, contract-to-hire and direct-hire placement",
      "Technical screening and reference checks before you interview",
      "Onboarding support and ongoing consultant care",
      "Compliance, payroll and W-2 employment handled for you",
    ],
    whoFor:
      "Engineering and talent-acquisition leaders at US technology companies who need to fill a critical role quickly, cover a short-term vacancy, or hire specialized AI skills that are hard to source through traditional channels.",
    industries: ["Technology", "Financial Services", "Healthcare", "Insurance", "Communications"],
    steps: [
      { title: "Scope the role", desc: "We learn your stack, your team and the outcome you are hiring for." },
      { title: "Source & screen", desc: "We tap our nationwide network and technically vet every candidate." },
      { title: "Interview & select", desc: "You meet a short list of pre-qualified engineers and choose." },
      { title: "Onboard & support", desc: "We handle the paperwork and stay close through the engagement." },
    ],
    ctaText: "Ready to fill a role? Talk to our Frisco, TX team about your IT staffing needs.",
  },
  team: {
    heading: "A dedicated technology team that runs alongside yours",
    intro:
      "Team Solutions gives you a managed, dedicated engineering pod - assembled, employed and supported by Techsara - that plugs into your roadmap and delivers as an extension of your own staff. It is IT staffing scaled to a full team: you keep strategic control while we handle recruitment, retention and day-to-day people management for enterprises across the United States.",
    includes: [
      "A dedicated pod of engineers, scientists and platform specialists",
      "Shared rituals, backlog and outcomes with your in-house team",
      "Application development, automation, cloud, data and QA coverage",
      "Flexible ramp-up and ramp-down as priorities change",
      "A single point of accountability for delivery and staffing",
    ],
    whoFor:
      "Product and engineering leaders who need durable capacity for ongoing initiatives - not just individual contractors - and want a partner to own recruiting, HR and retention while they focus on the work.",
    industries: ["Technology", "Financial Services", "Healthcare", "Insurance", "Communications"],
    steps: [
      { title: "Define the pod", desc: "We map the roles, skills and capacity your initiative needs." },
      { title: "Build the team", desc: "We staff and stand up the pod, embedded in your workflows." },
      { title: "Run together", desc: "Shared standups, backlog and KPIs keep delivery aligned." },
      { title: "Scale on demand", desc: "We flex the team up or down as your roadmap shifts." },
    ],
    ctaText: "Want a team that feels like your own? Let's scope your dedicated pod.",
  },
  international: {
    heading: "Global talent sourcing with US compliance handled",
    intro:
      "International Talent Solutions connects US enterprises with specialized onshore and offshore engineers while Techsara manages the immigration strategy, visa sponsorship and compliance that make global IT staffing work. From Frisco, TX we coordinate distributed delivery, so you get the skills you need and we carry the geography and the paperwork.",
    includes: [
      "Onshore and offshore engineering talent matched to your stack",
      "Visa sponsorship: H-1B, F-1/OPT, CPT and green-card holders",
      "Immigration strategy and resource risk assessment",
      "W-2 employment of every consultant",
      "Advisory services and ongoing engagement support",
    ],
    whoFor:
      "US companies that cannot find the specialized talent they need locally and want a compliant, lower-risk way to tap a global workforce without building their own immigration and HR function.",
    industries: ["Technology", "Financial Services", "Healthcare", "Insurance", "Communications"],
    steps: [
      { title: "Assess the need", desc: "We define the roles and the compliance considerations." },
      { title: "Source globally", desc: "We match onshore and offshore specialists from our network." },
      { title: "Sponsor & onboard", desc: "We handle visas, W-2 employment and risk mitigation." },
      { title: "Deliver & support", desc: "Distributed teams ship while we manage the logistics." },
    ],
    ctaText: "Need global talent without the compliance headache? Talk to Techsara.",
  },
};

function ServiceExpansion({ content }: { content: ExpansionContent }) {
  return (
    <section className="service-deepdive">
      <div className="container service-deepdive-inner">
        <div className="service-deepdive-head">
          <h2>{content.heading}</h2>
          <p>{content.intro}</p>
        </div>

        <div className="service-deepdive-cols">
          <div className="service-deepdive-block">
            <h3>What&apos;s included</h3>
            <ul className="service-deepdive-list">
              {content.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="service-deepdive-block">
            <h3>Who it&apos;s for</h3>
            <p>{content.whoFor}</p>
            <h3 className="service-deepdive-subhead">Industries we serve</h3>
            <ul className="service-deepdive-tags">
              {content.industries.map((industry) => (
                <li key={industry}>{industry}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="service-deepdive-process">
          <h3>How it works</h3>
          <ol className="service-deepdive-steps">
            {content.steps.map((step, i) => (
              <li key={step.title}>
                <span className="service-deepdive-step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="service-deepdive-cta">
          <p>{content.ctaText}</p>
          <Link href="/book" className="btn btn-primary">
            Book a free consultation
            <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
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
