"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSwipe } from "@/lib/useSwipe";

const slides = [
  {
    id: "migration",
    kicker: "Together Toward Tomorrow",
    titleLines: [
      "Technology industry: migrating",
      "on-premises systems to AWS cloud",
    ],
    cta: "Read More",
    href: "#trends-insights",
    theme: "blue-wave",
  },
  {
    id: "genai",
    kicker: "Together Toward Tomorrow",
    titleLines: [
      "Preparing your organization",
      "for generative AI",
    ],
    cta: "Read More",
    href: "#trends-insights",
    theme: "mist-blue",
  },
  {
    id: "copilot",
    kicker: "Together Toward Tomorrow",
    titleLines: [
      "GitHub Copilot: software delivery",
      "teams' best friend or worst enemy?",
    ],
    cta: "Read More",
    href: "#trends-insights",
    theme: "violet-streak",
  },
];

const SECTION_ART_MAP: Record<string, {
  arts: string[]; visuals: string[]
}> = {
  'data-ai': {
    arts:    ['neural', 'bars',    'stream'],
    visuals: ['mesh-a', 'wave-a',  'glow-a'],
  },
  'cloud': {
    arts:    ['cloud',     'mesh',   'bars'],
    visuals: ['circuit-a', 'mesh-b', 'wave-b'],
  },
  'genai': {
    arts:    ['spark',  'neural',  'lens'],
    visuals: ['glow-b', 'mesh-c',  'circuit-b'],
  },
  'industry': {
    arts:    ['lens',   'stream',  'gauge'],
    visuals: ['wave-c', 'glow-c',  'circuit-c'],
  },
  'ai-staffing': {
    arts:    ['neural',  'mesh',   'bars'],
    visuals: ['mesh-a',  'mesh-b', 'wave-a'],
  },
};
const DEFAULT_ART_MAP = {
  arts:    ['neural',  'bars',   'stream'],
  visuals: ['mesh-a',  'wave-a', 'glow-a'],
};
function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function getArticleArt(
  sectionId: string,
  index: number,
  articleId?: string
): { art: string; visual: string } {
  const map = SECTION_ART_MAP[sectionId] || DEFAULT_ART_MAP;
  const seed = articleId ? hashId(articleId) : index;
  const i = seed % map.arts.length;
  return { art: map.arts[i], visual: map.visuals[i] };
}

export default function TrendsPageClient() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOverHero, setIsOverHero] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const carouselRef = useRef<HTMLElement | null>(null);
  const [s3Articles, setS3Articles] = useState<S3Article[]>([]);
  const [s3Sections, setS3Sections] = useState<any[]>([]);

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
      const carousel = document.querySelector(".trends-carousel");
      if (!carousel) return;

      setIsOverHero(carousel.getBoundingClientRect().bottom > 120);
    };

    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme);
    updateNavTheme();

    return () => {
      window.removeEventListener("scroll", updateNavTheme);
      window.removeEventListener("resize", updateNavTheme);
    };
  }, []);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setS3Articles(
            data.articles.filter((a: S3Article) => a.status === 'published')
          );
        }
      })
      .catch(() => {});

    fetch('/api/sections')
      .then(r => r.json())
      .then(data => {
        if (data.success) setS3Sections(data.sections);
      })
      .catch(() => {});
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

  // Map existing hardcoded categories with S3 articles
  const mergedCategories = trendCategories.map(category => {
    const s3ForSection = s3Articles.filter(a => a.sectionId === category.id);
    const sectionGradient =
      s3Sections.find(s => s.id === category.id)?.gradient ||
      'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)';
    return { ...category, s3Articles: s3ForSection, sectionGradient };
  });

  // Add S3-only sections (not in hardcoded trendCategories)
  const hardcodedIds = new Set(trendCategories.map(c => c.id));
  const s3OnlySections = s3Sections
    .filter(s => !hardcodedIds.has(s.id))
    .sort((a, b) => (a.order || 99) - (b.order || 99))
    .map(s => ({
      id: s.id,
      label: s.name,
      iconKey: 'data' as const,
      title: s.heading || `${s.name} articles`,
      topicKicker: s.categoryTags?.join(', ') || '',
      description: s.description || '',
      articles: [],
      s3Articles: s3Articles.filter(a => a.sectionId === s.id),
      sectionGradient: s.gradient ||
        'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    }));

  const allCategories = [...mergedCategories, ...s3OnlySections];

  return (
    <main className="trends-page">
      {/* Single, stable page H1 (the carousel titles are decorative H2s that rotate). */}
      <h1 className="sr-only">AI &amp; Technology Insights for Enterprises</h1>
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

      <section ref={carouselRef} className="trends-carousel" aria-label="Featured trends">
        <div className="trends-carousel-track">
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className={`trends-slide trends-slide--${slide.theme}${index === activeIndex ? " is-active" : ""}`}
              aria-hidden={index === activeIndex ? "false" : "true"}
            >
              <div className="trends-slide-overlay" aria-hidden="true" />
              <div className="container trends-slide-inner">
                <p className="trends-slide-kicker">{slide.kicker}</p>
                <h2>
                  {slide.titleLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h2>
              </div>
            </article>
          ))}
        </div>

        <button type="button" className="trends-arrow trends-arrow-left" onClick={goPrev} aria-label="Previous trend">
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" className="trends-arrow trends-arrow-right" onClick={goNext} aria-label="Next trend">
          <span aria-hidden="true">›</span>
        </button>

        <div className="trends-dots" role="tablist" aria-label="Trend slides">
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

      <InsightSection />
      <CategoryNav extraSections={s3OnlySections} />
      {allCategories.map((category) => (
        <TopicSection key={category.id} category={category} />
      ))}
      {/* <ExpertsSection /> - hidden; uncomment to restore */}
      {false && <ExpertsSection />}
      <Footer />
    </main>
  );
}

type ArtKind =
  | "neural"
  | "bars"
  | "stream"
  | "cloud"
  | "mesh"
  | "spark"
  | "lens"
  | "gauge";

type Article = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  visual: string;
  art: ArtKind;
};

type S3Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  categoryLabel: string;
  sectionId: string;
  status: string;
  createdAt: string;
  art?: string;
  visual?: string;
};

type TrendCategory = {
  id: string;
  label: string;
  iconKey: "data" | "cloud" | "spark" | "industry";
  title: string;
  topicKicker: string;
  description: string;
  articles: Article[];
};

const trendCategories: TrendCategory[] = [
  {
    id: "data-ai",
    label: "Data & AI",
    iconKey: "data",
    title: "Data and AI articles",
    topicKicker: "Governance, Migration, Predictive ML, MLOps",
    description:
      "We serve our clients throughout the full data lifecycle: from describing past performance and understanding current progress to predicting future outcomes and prescribing next steps to improve efficiency and grow revenue.",
    articles: [],
  },
  {
    id: "cloud",
    label: "Cloud",
    iconKey: "cloud",
    title: "Cloud and infrastructure articles",
    topicKicker: "Migration, Cost Optimization, Hybrid Edge, Compliance",
    description:
      "From on-prem to hyperscale, we help teams modernize platforms without the migration scars. Practical playbooks for cost, resilience and compliance - drawn from regulated, capital-intensive engagements.",
    articles: [],
  },
  {
    id: "genai",
    label: "Generative AI",
    iconKey: "spark",
    title: "Generative AI articles",
    topicKicker: "LLMs, RAG, Fine-Tuning, Conversational Intelligence",
    description:
      "Beyond the demo. We help enterprises stand up generative AI that is grounded in their data, governed by their policies, and measured against business outcomes - not vibes.",
    articles: [],
  },
  {
    id: "industry",
    label: "Industry Solutions",
    iconKey: "industry",
    title: "Industry insights",
    topicKicker: "Energy, Banking, Pharma, Manufacturing, Retail",
    description:
      "AI works when it speaks the language of your operations. These are the patterns and outcomes we have shipped inside regulated, capital-intensive industries where reliability is the product.",
    articles: [],
  },
];

function handleAnchorClick(event: React.MouseEvent<HTMLAnchorElement>) {
  const href = event.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  const target = document.querySelector(href);
  if (!target) return;
  event.preventDefault();
  const headerOffset = 96;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: "smooth" });
  history.replaceState(null, "", href);
}

function CategoryNav({
  extraSections = [],
}: {
  extraSections?: { id: string; label: string; iconKey: 'data' | 'cloud' | 'spark' | 'industry' }[];
}) {
  const allNavItems = [
    ...trendCategories,
    ...extraSections.map(s => ({
      id: s.id,
      label: s.label,
      iconKey: 'data' as const,
    })),
  ];
  return (
    <nav className="trends-category-bar" aria-label="Trend categories">
      <div className="container trends-category-inner">
        <div className="trends-category-links">
          {allNavItems.map((category) => (
            <a
              key={category.id}
              href={`#topic-${category.id}`}
              className="trends-category-link"
              onClick={handleAnchorClick}
            >
              <span className="trends-category-icon" aria-hidden="true">
                <TopicIcon iconKey={category.iconKey} />
              </span>
              <span className="trends-category-label">{category.label}</span>
            </a>
          ))}
        </div>
        {/* Meet Our Experts CTA - hidden; uncomment to restore
        <a
          href="#meet-experts"
          className="trends-category-link trends-category-cta"
          onClick={handleAnchorClick}
        >
          Meet Our Experts
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        */}
      </div>
    </nav>
  );
}

function TopicIcon({ iconKey }: { iconKey: TrendCategory["iconKey"] }) {
  if (iconKey === "data") {
    return (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 4a12 12 0 0 1 12 12H16V4Z" fill="currentColor" opacity="0.95" />
        <path d="M16 16 4 28a12 12 0 0 1 12-24v12Z" fill="currentColor" opacity="0.55" />
        <circle cx="16" cy="16" r="2.2" fill="#fff" />
      </svg>
    );
  }
  if (iconKey === "cloud") {
    return (
      <svg width="36" height="32" viewBox="0 0 36 32" fill="none" aria-hidden="true">
        <path
          d="M10 24a7 7 0 0 1-1.6-13.8A8.5 8.5 0 0 1 25 10.4 6 6 0 0 1 28 22H10Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path d="M14 27.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      </svg>
    );
  }
  if (iconKey === "spark") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 3 18.4 12 28 14.4 18.4 17 16 26 13.6 17 4 14.4 13.6 12 16 3Z"
          fill="currentColor"
          opacity="0.95"
        />
        <circle cx="25" cy="6" r="1.6" fill="currentColor" opacity="0.55" />
        <circle cx="6" cy="25" r="1.2" fill="currentColor" opacity="0.55" />
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 28V12l8-5 8 5v3h8v13H4Z" fill="currentColor" opacity="0.95" />
      <path d="M9 18h2M9 22h2M15 18h2M15 22h2M23 19h2M23 23h2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ArticleArt({ kind }: { kind: ArtKind }) {
  const baseProps = {
    viewBox: "0 0 400 250",
    preserveAspectRatio: "xMidYMid slice" as const,
    className: `article-art article-art-${kind}`,
    "aria-hidden": true,
  };

  if (kind === "neural") {
    return (
      <svg {...baseProps}>
        <g stroke="rgba(180,225,255,0.42)" strokeWidth="1" fill="none">
          <line x1="80" y1="60" x2="200" y2="130" />
          <line x1="80" y1="60" x2="180" y2="200" />
          <line x1="320" y1="80" x2="200" y2="130" />
          <line x1="320" y1="80" x2="280" y2="200" />
          <line x1="200" y1="130" x2="180" y2="200" />
          <line x1="200" y1="130" x2="280" y2="200" />
          <line x1="80" y1="60" x2="320" y2="80" />
          <line x1="180" y1="200" x2="280" y2="200" />
        </g>
        <g fill="rgba(232,246,255,0.92)">
          <circle cx="80" cy="60" r="5" />
          <circle cx="320" cy="80" r="5" />
          <circle className="art-pulse" cx="200" cy="130" r="7" />
          <circle cx="180" cy="200" r="5" />
          <circle cx="280" cy="200" r="5" />
        </g>
      </svg>
    );
  }

  if (kind === "bars") {
    return (
      <svg {...baseProps}>
        <line x1="50" y1="220" x2="350" y2="220" stroke="rgba(220,240,255,0.28)" strokeWidth="1" />
        <g fill="rgba(180,225,255,0.32)">
          <rect x="60" y="170" width="38" height="50" rx="3" />
          <rect x="115" y="140" width="38" height="80" rx="3" />
          <rect x="170" y="110" width="38" height="110" rx="3" />
          <rect x="225" y="80" width="38" height="140" rx="3" />
          <rect x="280" y="50" width="38" height="170" rx="3" />
        </g>
        <path
          className="art-trend"
          d="M79 190 L134 152 L189 122 L244 90 L299 60"
          stroke="rgba(140,225,255,0.92)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g fill="#fff">
          <circle cx="79" cy="190" r="3" />
          <circle cx="134" cy="152" r="3" />
          <circle cx="189" cy="122" r="3" />
          <circle cx="244" cy="90" r="3" />
          <circle cx="299" cy="60" r="3" />
        </g>
      </svg>
    );
  }

  if (kind === "stream") {
    return (
      <svg {...baseProps}>
        <g stroke="rgba(180,225,255,0.5)" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path className="art-wave art-wave-a" d="M-10 120 Q70 80, 150 120 T310 120 T470 120" />
          <path className="art-wave art-wave-b" d="M-10 150 Q70 110, 150 150 T310 150 T470 150" opacity="0.7" />
          <path className="art-wave art-wave-c" d="M-10 180 Q70 140, 150 180 T310 180 T470 180" opacity="0.42" />
        </g>
        <g fill="rgba(255,255,255,0.92)">
          <circle cx="70" cy="100" r="2.5" />
          <circle cx="180" cy="120" r="3" />
          <circle cx="280" cy="105" r="2.5" />
          <circle cx="120" cy="155" r="2" />
          <circle cx="240" cy="170" r="2" />
        </g>
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg {...baseProps}>
        <path
          d="M120 95 a30 30 0 0 1 60 -8 a26 26 0 0 1 56 8 a22 22 0 0 1 14 36 H108 a24 24 0 0 1 12 -36 Z"
          fill="rgba(220,240,255,0.16)"
          stroke="rgba(200,235,255,0.7)"
          strokeWidth="1.4"
        />
        <g fill="rgba(8,24,45,0.28)" stroke="rgba(180,225,255,0.45)" strokeWidth="1">
          <rect x="118" y="160" width="52" height="14" rx="2" />
          <rect x="118" y="180" width="52" height="14" rx="2" />
          <rect x="180" y="160" width="52" height="14" rx="2" />
          <rect x="180" y="180" width="52" height="14" rx="2" />
          <rect x="242" y="160" width="52" height="14" rx="2" />
          <rect x="242" y="180" width="52" height="14" rx="2" />
        </g>
        <g className="art-dash" stroke="rgba(140,225,255,0.78)" strokeWidth="1.2" strokeDasharray="4 4" fill="none">
          <line x1="200" y1="134" x2="144" y2="160" />
          <line x1="200" y1="134" x2="206" y2="160" />
          <line x1="200" y1="134" x2="268" y2="160" />
        </g>
        <g fill="#7feaff">
          <circle cx="125" cy="167" r="1.8" />
          <circle cx="125" cy="187" r="1.8" />
          <circle cx="187" cy="167" r="1.8" />
          <circle cx="187" cy="187" r="1.8" />
          <circle cx="249" cy="167" r="1.8" />
          <circle cx="249" cy="187" r="1.8" />
        </g>
      </svg>
    );
  }

  if (kind === "mesh") {
    return (
      <svg {...baseProps}>
        <g className="art-rotate-slow" style={{ transformOrigin: "200px 125px" }}>
          <g stroke="rgba(180,225,255,0.4)" strokeWidth="1" fill="none">
            <polygon points="200,55 280,100 280,180 200,225 120,180 120,100" />
            <line x1="200" y1="55" x2="200" y2="225" />
            <line x1="120" y1="100" x2="280" y2="180" />
            <line x1="280" y1="100" x2="120" y2="180" />
            <line x1="120" y1="100" x2="280" y2="100" />
            <line x1="120" y1="180" x2="280" y2="180" />
          </g>
          <g fill="rgba(232,246,255,0.92)">
            <circle cx="200" cy="55" r="5" />
            <circle cx="280" cy="100" r="5" />
            <circle cx="280" cy="180" r="5" />
            <circle cx="200" cy="225" r="5" />
            <circle cx="120" cy="180" r="5" />
            <circle cx="120" cy="100" r="5" />
            <circle className="art-pulse" cx="200" cy="140" r="6" />
          </g>
        </g>
      </svg>
    );
  }

  if (kind === "spark") {
    return (
      <svg {...baseProps}>
        <g
          className="art-rays"
          stroke="rgba(200,235,255,0.78)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        >
          <line x1="200" y1="50" x2="200" y2="95" />
          <line x1="200" y1="155" x2="200" y2="200" />
          <line x1="105" y1="125" x2="155" y2="125" />
          <line x1="245" y1="125" x2="295" y2="125" />
          <line x1="138" y1="63" x2="170" y2="95" />
          <line x1="230" y1="155" x2="262" y2="187" />
          <line x1="262" y1="63" x2="230" y2="95" />
          <line x1="170" y1="155" x2="138" y2="187" />
        </g>
        <path
          className="art-pulse-slow"
          d="M200 96 L222 125 L200 154 L178 125 Z"
          fill="rgba(232,246,255,0.95)"
        />
        <g fill="rgba(255,255,255,0.7)">
          <circle cx="80" cy="60" r="1.8" />
          <circle cx="320" cy="200" r="1.8" />
          <circle cx="325" cy="70" r="1.4" />
          <circle cx="75" cy="195" r="1.4" />
        </g>
      </svg>
    );
  }

  if (kind === "lens") {
    return (
      <svg {...baseProps}>
        <g stroke="rgba(180,225,255,0.32)" strokeWidth="1">
          <line x1="40" y1="70" x2="360" y2="70" />
          <line x1="40" y1="125" x2="360" y2="125" />
          <line x1="40" y1="180" x2="360" y2="180" />
          <line x1="90" y1="40" x2="90" y2="220" />
          <line x1="200" y1="40" x2="200" y2="220" />
          <line x1="310" y1="40" x2="310" y2="220" />
        </g>
        <g fill="rgba(120,210,255,0.55)">
          <circle cx="90" cy="70" r="3" />
          <circle cx="310" cy="180" r="3" />
          <circle cx="200" cy="125" r="3" />
        </g>
        <circle
          className="art-lens-ring"
          cx="240"
          cy="150"
          r="50"
          fill="rgba(8,24,45,0.32)"
          stroke="rgba(232,246,255,0.9)"
          strokeWidth="2.6"
        />
        <line
          x1="278"
          y1="188"
          x2="312"
          y2="222"
          stroke="rgba(232,246,255,0.9)"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <g fill="rgba(140,225,255,0.95)">
          <circle cx="220" cy="135" r="3.5" />
          <circle cx="255" cy="148" r="2.5" />
          <circle cx="240" cy="172" r="3.5" />
        </g>
      </svg>
    );
  }

  // gauge
  return (
    <svg {...baseProps}>
      <path
        d="M80 180 A120 120 0 0 1 320 180"
        stroke="rgba(180,225,255,0.34)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        className="art-gauge-arc"
        d="M80 180 A120 120 0 0 1 250 92"
        stroke="rgba(140,225,255,0.95)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke="rgba(220,240,255,0.5)" strokeWidth="1.4" strokeLinecap="round">
        <line x1="92" y1="172" x2="100" y2="166" />
        <line x1="118" y1="138" x2="125" y2="144" />
        <line x1="155" y1="112" x2="161" y2="120" />
        <line x1="200" y1="100" x2="200" y2="110" />
        <line x1="245" y1="112" x2="239" y2="120" />
        <line x1="282" y1="138" x2="275" y2="144" />
        <line x1="308" y1="172" x2="300" y2="166" />
      </g>
      <line
        className="art-gauge-needle"
        x1="200"
        y1="180"
        x2="248"
        y2="118"
        stroke="rgba(232,246,255,0.95)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="200" cy="180" r="6" fill="rgba(232,246,255,0.95)" />
      <circle cx="200" cy="180" r="2.2" fill="#1e8fce" />
    </svg>
  );
}

function CarouselGrid({ children, total }: {
  children: React.ReactNode;
  total: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth / 3 + 24;
    el.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    setTimeout(updateScrollState, 350);
  };

  const arrowStyle = (visible: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: visible ? 'pointer' : 'default',
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    transition: 'opacity 0.2s',
    zIndex: 10,
    fontSize: '16px',
    color: '#1e3a8a',
    fontWeight: '700',
    userSelect: 'none',
  });

  return (
    <div style={{ position: 'relative', padding: '0 56px' }}>
      <button
        onClick={() => scroll('left')}
        style={{ ...arrowStyle(canScrollLeft), left: '8px' }}
        aria-label="Scroll left"
      >
        ←
      </button>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '24px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '4px',
        }}
      >
        <style>{`.carousel-track::-webkit-scrollbar { display: none; }`}</style>
        {React.Children.map(children, (child) => (
          <div style={{
            flex: '0 0 calc(33.333% - 16px)',
            minWidth: 'calc(33.333% - 16px)',
            scrollSnapAlign: 'start',
          }}>
            {child}
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        style={{ ...arrowStyle(canScrollRight), right: '8px' }}
        aria-label="Scroll right"
      >
        →
      </button>
    </div>
  );
}

function TopicSection({ category }: {
  category: TrendCategory & { s3Articles?: S3Article[]; sectionGradient?: string };
}) {
  return (
    <section id={`topic-${category.id}`} className="trends-topic">
      <div className="container">
        <header className="trends-topic-head">
          <span className="trends-topic-icon" aria-hidden="true">
            <TopicIcon iconKey={category.iconKey} />
          </span>
          <h2>{category.title}</h2>
          <p className="trends-topic-kicker">{category.topicKicker}</p>
          <p className="trends-topic-desc">{category.description}</p>
        </header>

        {(() => {
          const totalArticles =
            (category.articles?.length || 0) +
            (category.s3Articles?.length || 0);

          const allCards = [
            ...(category.articles || []).map((article: any) => (
              <article key={article.id} className="trends-article-card" tabIndex={0}>
                <div className={`trends-article-visual visual-${article.visual}`} aria-hidden="true">
                  <span className="visual-mesh-overlay" />
                  <ArticleArt kind={article.art} />
                  <div className="trends-article-overlay">
                    <p className="trends-article-desc">{article.description}</p>
                  </div>
                </div>
                <div className="trends-article-body">
                  <p className="trends-article-kicker">{article.kicker}</p>
                  <h3>{article.title}</h3>
                  <span className="trends-article-plus" aria-hidden="true">+</span>
                </div>
              </article>
            )),
            ...(category.s3Articles || []).map((article: S3Article, index: number) => {
              const { art, visual } = getArticleArt(category.id, index, article.id);
              return (
                <article
                  key={article.id}
                  className="trends-article-card"
                  tabIndex={0}
                  style={article.slug ? { cursor: 'pointer' } : undefined}
                  onClick={() => { if (article.slug) window.location.href = `/articles/${article.slug}`; }}
                >
                  <div
                    className={`trends-article-visual visual-${article.visual || visual}`}
                    aria-hidden="true"
                  >
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>
                        <span className="visual-mesh-overlay" />
                        <ArticleArt kind={(article.art || art) as any} />
                      </>
                    )}
                    <div className="trends-article-overlay">
                      <p className="trends-article-desc">{article.excerpt}</p>
                    </div>
                  </div>
                  <div className="trends-article-body">
                    {article.categoryLabel && (
                      <p className="trends-article-kicker">{article.categoryLabel}</p>
                    )}
                    <h3>{article.title}</h3>
                    {article.excerpt && (
                      <p className="trends-article-desc">{article.excerpt}</p>
                    )}
                    {article.slug && (
                      <a
                        href={`/articles/${article.slug}`}
                        className="trends-article-plus"
                        aria-label={`Read full article: ${article.title}`}
                        style={{ textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}
                      >
                        +
                      </a>
                    )}
                  </div>
                </article>
              );
            }),
          ];

          if (totalArticles <= 3) {
            return <div className="trends-articles-grid">{allCards}</div>;
          }

          return <CarouselGrid total={totalArticles}>{allCards}</CarouselGrid>;
        })()}
      </div>
    </section>
  );
}

function ExpertsSection() {
  const experts = [
    {
      name: "Avani Iyer",
      role: "Director, Data & AI",
      focus: "Predictive ML, MLOps, data governance",
    },
    {
      name: "Marcus Chen",
      role: "Principal Cloud Architect",
      focus: "AWS migration, hybrid edge, FinOps",
    },
    {
      name: "Sofia Reyes",
      role: "Lead Generative AI Engineer",
      focus: "LLMs, RAG, evaluation harnesses",
    },
    {
      name: "Daniel Park",
      role: "Industry Solutions Partner",
      focus: "Energy, manufacturing, pharma",
    },
  ];
  return (
    <section id="meet-experts" className="trends-experts">
      <div className="container">
        <header className="trends-experts-head">
          <p className="trends-experts-kicker">Meet Our Experts</p>
          <h2>The people behind the work</h2>
          <p>
            The team you&apos;ll actually meet on day one - leads who have shipped, scaled and
            supported AI inside the operations they&apos;re advising.
          </p>
        </header>
        <div className="trends-experts-grid">
          {experts.map((expert) => (
            <article key={expert.name} className="trends-expert-card">
              <span className="trends-expert-avatar" aria-hidden="true">
                {expert.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </span>
              <h3>{expert.name}</h3>
              <p className="trends-expert-role">{expert.role}</p>
              <p className="trends-expert-focus">{expert.focus}</p>
            </article>
          ))}
        </div>
        <div className="trends-experts-cta">
          <Link href="/book" className="btn btn-primary">
            Book a consultation
            <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function InsightSection() {
  return (
    <section className="trends-insights" id="trends-insights">
      <div className="container trends-insights-grid">
        <div className="trends-insights-copy">
          <h2>
            <span>Actionable insights for</span>
            <span>flexible solutions</span>
          </h2>
          <p>
            We are thought leaders, problem solvers and knowledge seekers. Each day, we look for
            opportunities to expand the use of technology, uncover trends and discover new ways of
            doing business. We partner with industry-leading companies in pursuit of the next great
            idea. Our experts provide actionable insights that power our clients&apos; most critical
            projects. It is through knowledge sharing - powered by strong relationships,
            industry-leading data and innovative technology - that we empower our clients to
            reimagine how business gets done. When companies want knowledge, leadership and
            flexibility, they look to Techsara. <strong>Together, let&apos;s do great things.</strong>
          </p>
        </div>

        <div className="trends-technology-visual" aria-label="Animated technology visual">
          <div className="tech-aurora" aria-hidden="true" />
          <div className="tech-aurora tech-aurora-b" aria-hidden="true" />

          <svg
            className="tech-network"
            viewBox="0 0 600 460"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="techNodeCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e8fce" stopOpacity="1" />
                <stop offset="55%" stopColor="#1e8fce" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#1e8fce" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="techEdgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(80, 200, 255, 0)" />
                <stop offset="50%" stopColor="rgba(150, 230, 255, 0.9)" />
                <stop offset="100%" stopColor="rgba(80, 200, 255, 0)" />
              </linearGradient>
            </defs>

            <g className="tech-orbit-system">
              <ellipse className="tech-orbit-ring tech-orbit-ring-1" cx="300" cy="230" rx="240" ry="92" />
              <ellipse className="tech-orbit-ring tech-orbit-ring-2" cx="300" cy="230" rx="240" ry="92" />
              <ellipse className="tech-orbit-ring tech-orbit-ring-3" cx="300" cy="230" rx="170" ry="170" />
            </g>

            <g className="tech-edges">
              <line className="tech-edge" x1="90" y1="150" x2="520" y2="290" />
              <line className="tech-edge" x1="520" y1="160" x2="120" y2="340" />
              <line className="tech-edge" x1="200" y1="70" x2="430" y2="390" />
              <line className="tech-edge" x1="80" y1="320" x2="500" y2="120" />
              <line className="tech-edge" x1="300" y1="60" x2="300" y2="400" />
            </g>

            <g className="tech-nodes">
              <circle className="tech-node" cx="90" cy="150" r="3.6" />
              <circle className="tech-node" cx="520" cy="290" r="3.6" />
              <circle className="tech-node" cx="520" cy="160" r="3.2" />
              <circle className="tech-node" cx="120" cy="340" r="3.2" />
              <circle className="tech-node" cx="200" cy="70" r="2.8" />
              <circle className="tech-node" cx="430" cy="390" r="2.8" />
              <circle className="tech-node" cx="80" cy="320" r="2.8" />
              <circle className="tech-node" cx="500" cy="120" r="3.2" />
              <circle className="tech-node tech-node-core" cx="300" cy="230" r="5.2" />
            </g>
          </svg>

          <div className="tech-insight-chip chip-insight">Insight</div>
          <div className="tech-insight-chip chip-trends">Trends</div>
          <div className="tech-insight-chip chip-solutions">Solutions</div>
          <div className="tech-word"><span>TECHNOLOGY</span></div>
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
