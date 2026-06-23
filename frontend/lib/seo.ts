// ============================================
// TECHSARA - Central SEO configuration
// One source of truth for site URL, brand, locale and structured-data builders.
// ============================================

export const SITE = {
  url: "https://www.techsarasolutions.com",
  name: "Techsara",
  legalName: "Techsara Solutions",
  // en-US locale signals to search engines that the primary audience is the United States.
  locale: "en_US",
  twitter: "@techsara",
  // ~190 chars - kept inside the 150–220 band SEO audits prefer, and front-loaded with the
  // primary keywords (AI development, IT staffing, cloud, engineering, solutions).
  description:
    "Techsara Solutions is a Frisco, Texas based AI development, IT staffing, and cloud consulting company. We build and deploy production AI solutions and staff senior cloud and software engineering teams for US enterprises.",
  // Static 1200×630 social card (regenerate with scripts/generate-og-image.py).
  ogImage: "/assets/og-image.png",
  // Verified NAP (name/address/phone) - the single source of truth for LocalBusiness
  // structured data and on-page contact details. Reinforces US/Frisco geo-relevance.
  telephone: "+13235961938",
  email: "hello@techsarasolutions.com",
  address: {
    addressLocality: "Frisco",
    addressRegion: "TX",
    postalCode: "75034",
    addressCountry: "US",
  },
  linkedIn: "https://www.linkedin.com/company/techsara-solutions",
  // Every REAL, owned profile that corroborates the brand entity for Google's Knowledge
  // Graph and AI search. Only add profiles Techsara actually controls - an unverifiable
  // sameAs link hurts rather than helps. Extend as new profiles (Crunchbase, Clutch, G2,
  // GitHub, X, etc.) are confirmed.
  sameAs: ["https://www.linkedin.com/company/techsara-solutions"],
} as const;

export const HOME_SERVICE_OFFERINGS = [
  {
    name: "Generative AI and LLM Development",
    description:
      "Custom LLM applications, retrieval augmented generation, fine-tuning, AI agents, and enterprise copilots.",
    path: "/solutions/generative-ai",
    serviceType: "AI development",
  },
  {
    name: "IT Staffing and AI Talent",
    description:
      "Direct-hire AI, ML, data, cloud, and software engineering talent for enterprise teams.",
    path: "/services/talent",
    serviceType: "IT staffing",
  },
  {
    name: "Managed AI Delivery Teams",
    description:
      "Dedicated engineering teams for production AI, cloud, data, and software delivery.",
    path: "/services/team",
    serviceType: "Managed delivery team",
  },
  {
    name: "Cloud, On-Premise, and Edge AI Deployment",
    description:
      "AWS, Azure, GCP, on-premise, air-gapped, hybrid, and edge AI infrastructure for regulated workloads.",
    path: "/solutions/cloud-deployment",
    serviceType: "AI infrastructure",
  },
  {
    name: "MLOps and Production AI Operations",
    description:
      "Model deployment, monitoring, evaluation, CI/CD, observability, and cost optimization for AI workloads.",
    path: "/solutions/mlops",
    serviceType: "MLOps",
  },
] as const;

/**
 * Clamp a free-text string to a meta-description that lands inside the SEO-preferred
 * 150–220 character band: it never cuts mid-word (trims back to the last whole word and
 * appends an ellipsis) and, when the source is shorter than `min`, falls back to the
 * supplied `fallback` so the description is never too thin. Centralized so every dynamic
 * page (e.g. /solutions/[slug]) gets a well-sized snippet from one place.
 */
export function clampDescription(text: string, fallback: string, max = 200): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  const base = clean.length >= 150 ? clean : fallback.replace(/\s+/g, " ").trim();
  if (base.length <= max) return base;
  const cut = base.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[\s,;:.]+$/, "")}…`;
}

/** Build an absolute URL from a site-relative path (always leading-slash, no trailing slash except root). */
export function absoluteUrl(path = "/") {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE.url}${clean.startsWith("/") || clean === "" ? clean : `/${clean}`}`;
}

/** Resolve an image reference to an absolute URL - passes through absolute (http) URLs,
 *  prefixes site-relative paths. Prevents double-prefixed URLs in structured data. */
function resolveImage(image?: string) {
  if (!image) return absoluteUrl(SITE.ogImage);
  return image.startsWith("http") ? image : absoluteUrl(image);
}

/**
 * Serialize structured data for injection into a <script type="application/ld+json"> via
 * dangerouslySetInnerHTML. JSON.stringify does NOT escape characters that can break out of
 * a <script> element ("</script>") or a JS string (U+2028/U+2029); this does, so editor-
 * authored content (titles, FAQ answers, …) can never terminate the script early. The
 * escaped sequences are still valid JSON, so crawlers parse the original characters.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * A complete Open Graph object for a page. Next.js replaces (does not deep-merge) the
 * `openGraph` field per route segment, so every page must restate type/siteName/locale/image
 * - this helper keeps that consistent in one place.
 */
export function pageOpenGraph(opts: { title: string; description: string; path: string }) {
  return {
    type: "website" as const,
    siteName: SITE.name,
    locale: SITE.locale,
    url: absoluteUrl(opts.path),
    title: opts.title,
    description: opts.description,
    images: [
      { url: SITE.ogImage, width: 1200, height: 630, alt: opts.title },
    ],
  };
}

/**
 * Organization structured data - establishes the brand entity for Google's Knowledge Graph
 * and feeds AI search. United-States address/contact reinforces US geo-relevance.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/assets/techsara-logo.png`,
    description: SITE.description,
    foundingDate: "2021",
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Generative AI",
      "Large Language Models",
      "Computer Vision",
      "MLOps",
      "Cloud Deployment",
      "AI Consulting",
    ],
    address: {
      "@type": "PostalAddress",
      ...SITE.address,
    },
    telephone: SITE.telephone,
    email: SITE.email,
    sameAs: [...SITE.sameAs],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: SITE.telephone,
      email: SITE.email,
      availableLanguage: ["English"],
      areaServed: "US",
    },
  };
}

/**
 * ProfessionalService (a LocalBusiness subtype) - gives Google an explicit local
 * business entity with NAP, hours and service area. Rendered sitewide so the brand's
 * Frisco, TX presence is unambiguous for local + AI-search results.
 */
export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}/#localbusiness`,
    name: SITE.legalName,
    url: SITE.url,
    image: `${SITE.url}${SITE.ogImage}`,
    logo: `${SITE.url}/assets/techsara-logo.png`,
    telephone: SITE.telephone,
    email: SITE.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...SITE.address,
    },
    areaServed: { "@type": "Country", name: "United States" },
    openingHours: "Mo-Fr 08:00-18:00",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    parentOrganization: { "@id": `${SITE.url}/#organization` },
    sameAs: [...SITE.sameAs],
  };
}

/** WebSite structured data - enables sitelinks search box and names the site entity. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: "en-US",
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

/** Homepage WebPage structured data for the root URL. */
export function homePageJsonLd(opts: {
  title: string;
  description: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE.url}/#webpage`,
    url: SITE.url,
    name: opts.title,
    description: opts.description,
    dateModified: opts.dateModified || "2026-06-12",
    inLanguage: "en-US",
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: { "@id": `${SITE.url}/#organization` },
    mainEntity: { "@id": `${SITE.url}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE.ogImage),
      width: 1200,
      height: 630,
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType: "US enterprise technology leaders",
      geographicArea: { "@type": "Country", name: "United States" },
    },
    keywords: HOME_SERVICE_OFFERINGS.map((offering) => offering.name).join(", "),
    significantLink: HOME_SERVICE_OFFERINGS.map((offering) => absoluteUrl(offering.path)),
    // Nominate the FAQ answer headline + lead paragraph for voice assistants / AI read-aloud.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#home-answer-title", ".hero-dark-sub"],
    },
  };
}

/** Homepage catalog of the main services surfaced above the fold and in navigation. */
export function homeOfferCatalogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${SITE.url}/#offer-catalog`,
    name: "Techsara AI development and IT staffing services",
    url: SITE.url,
    itemListElement: HOME_SERVICE_OFFERINGS.map((offering) => ({
      "@type": "Offer",
      url: absoluteUrl(offering.path),
      areaServed: { "@type": "Country", name: "United States" },
      itemOffered: {
        "@type": "Service",
        "@id": `${absoluteUrl(offering.path)}#service`,
        name: offering.name,
        description: offering.description,
        serviceType: offering.serviceType,
        provider: { "@id": `${SITE.url}/#organization` },
        areaServed: { "@type": "Country", name: "United States" },
      },
    })),
  };
}

/** Service structured data for a service/solution detail page. */
export function serviceJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    serviceType: opts.category || "AI Service",
    url: absoluteUrl(opts.path),
    areaServed: { "@type": "Country", name: "United States" },
    provider: { "@id": `${SITE.url}/#organization` },
  };
}

/** BreadcrumbList structured data - drives breadcrumb rich results in SERPs. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Open Graph object for an editorial article (blog post). Next.js replaces (does not merge)
 * `openGraph` per route, so - like pageOpenGraph - every field is restated here. Uses
 * type:"article" so social/AI crawlers treat it as a dated, authored piece.
 */
export function articleOpenGraph(opts: {
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
  tags?: string[];
  image?: string;
}) {
  return {
    type: "article" as const,
    siteName: SITE.name,
    locale: SITE.locale,
    url: absoluteUrl(opts.path),
    title: opts.title,
    description: opts.description,
    publishedTime: opts.publishedTime,
    modifiedTime: opts.modifiedTime || opts.publishedTime,
    authors: opts.authorName ? [opts.authorName] : undefined,
    tags: opts.tags,
    images: [
      { url: opts.image || SITE.ogImage, width: 1200, height: 630, alt: opts.title },
    ],
  };
}

/**
 * BlogPosting structured data for an individual article. Ties the piece to the brand
 * Organization (author worksFor / publisher), declares language and US relevance, and
 * gives Google the headline/date/keywords it needs for article rich results + AI search.
 */
export function blogPostingJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  publishedDate: string;
  modifiedDate?: string;
  authorName: string;
  authorTitle?: string;
  image?: string;
  keywords?: string[];
  section?: string;
  wordCount?: number;
}) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: opts.title,
    description: opts.description,
    image: resolveImage(opts.image),
    datePublished: opts.publishedDate,
    dateModified: opts.modifiedDate || opts.publishedDate,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: opts.authorName,
      ...(opts.authorTitle ? { jobTitle: opts.authorTitle } : {}),
      worksFor: { "@id": `${SITE.url}/#organization` },
    },
    publisher: { "@id": `${SITE.url}/#organization` },
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(", ") } : {}),
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    // Read-aloud surface for voice/AI summarizers - headline + the key-takeaways block.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".blog-post-title", ".blog-takeaways"],
    },
  };
}

/** Blog structured data - names the blog entity and lists its posts as an itemized feed. */
export function blogJsonLd(
  posts: { title: string; description: string; path: string; datePublished: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/blogs#blog`,
    name: `${SITE.name} Blog`,
    description:
      "Enterprise AI, staffing, cloud and MLOps insight for US B2B technology leaders - from the Techsara team.",
    url: absoluteUrl("/blogs"),
    inLanguage: "en-US",
    publisher: { "@id": `${SITE.url}/#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: absoluteUrl(p.path),
      datePublished: p.datePublished,
    })),
  };
}

/** FAQPage structured data - surfaces an article's Q&A as eligible for FAQ rich results. */
export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/**
 * HowTo structured data - encodes Techsara's real, step-by-step delivery methodology so AI
 * answer engines can extract "how Techsara works" (directly answers the audit's "Sparse
 * Methodology" / "Limited Proof Depth" findings). Steps describe the genuine process; do not
 * invent stages the team does not actually run.
 */
export function howToJsonLd(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string; url?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: absoluteUrl(s.url) } : {}),
    })),
  };
}

/**
 * Person structured data for a real Techsara team member / author. Anchored by @id so the
 * same person can be referenced from BlogPosting.author, Organization.employee/founder, and
 * the /about page. ONLY emit for real, named people with verifiable profiles - never for
 * placeholder or fabricated identities (a Person node for a non-existent person is a trust
 * liability and an AI-detectable contradiction).
 */
export function personJsonLd(opts: {
  slug: string;
  name: string;
  jobTitle: string;
  bio?: string;
  image?: string;
  sameAs?: string[];
  knowsAbout?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE.url}/about#person-${opts.slug}`,
    name: opts.name,
    jobTitle: opts.jobTitle,
    ...(opts.bio ? { description: opts.bio } : {}),
    ...(opts.image ? { image: resolveImage(opts.image) } : {}),
    worksFor: { "@id": `${SITE.url}/#organization` },
    url: `${SITE.url}/about`,
    ...(opts.sameAs?.length ? { sameAs: opts.sameAs } : {}),
    ...(opts.knowsAbout?.length ? { knowsAbout: opts.knowsAbout } : {}),
  };
}

/**
 * Review structured data for ONE testimonial. Emit only for real, permission-cleared reviews
 * with a genuine author and verifiable provenance. Unpopulated until the owner supplies real
 * testimonials - never fabricate reviewer names, companies, or quotes.
 */
export function reviewJsonLd(opts: {
  author: string;
  authorTitle?: string;
  body: string;
  rating?: number;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@id": `${SITE.url}/#organization` },
    author: {
      "@type": "Person",
      name: opts.author,
      ...(opts.authorTitle ? { jobTitle: opts.authorTitle } : {}),
    },
    reviewBody: opts.body,
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.rating
      ? {
          reviewRating: {
            "@type": "Rating",
            ratingValue: opts.rating,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/**
 * AggregateRating for the Organization, derived from REAL third-party review data only
 * (e.g. a verified Clutch / G2 / Google Business rating). Returns null when no real rating
 * exists so the caller omits it rather than shipping a fabricated score.
 */
export function aggregateRatingJsonLd(opts: { ratingValue: number; reviewCount: number } | null) {
  if (!opts || !opts.reviewCount) return null;
  return {
    "@type": "AggregateRating",
    ratingValue: opts.ratingValue,
    reviewCount: opts.reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * AboutPage structured data - declares /about as the canonical "about" WebPage for the brand
 * entity so search/AI engines can resolve the company's identity, history, and people.
 */
export function aboutPageJsonLd(opts: { title: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE.url}/about#webpage`,
    url: absoluteUrl("/about"),
    name: opts.title,
    description: opts.description,
    inLanguage: "en-US",
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: { "@id": `${SITE.url}/#organization` },
    mainEntity: { "@id": `${SITE.url}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE.ogImage),
      width: 1200,
      height: 630,
    },
  };
}
