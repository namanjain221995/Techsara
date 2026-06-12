// ============================================
// TECHSARA — Central SEO configuration
// One source of truth for site URL, brand, locale and structured-data builders.
// ============================================

export const SITE = {
  url: "https://www.techsarasolutions.com",
  name: "Techsara",
  legalName: "Techsara Solutions",
  // en-US locale signals to search engines that the primary audience is the United States.
  locale: "en_US",
  twitter: "@techsara",
  description:
    "Techsara delivers end-to-end AI development, cloud and on-premise deployment, and strategic consulting for enterprises.",
  // Static 1200×630 social card (regenerate with scripts/generate-og-image.py).
  ogImage: "/assets/og-image.png",
  // Verified NAP (name/address/phone) — the single source of truth for LocalBusiness
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
} as const;

/** Build an absolute URL from a site-relative path (always leading-slash, no trailing slash except root). */
export function absoluteUrl(path = "/") {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE.url}${clean.startsWith("/") || clean === "" ? clean : `/${clean}`}`;
}

/** Resolve an image reference to an absolute URL — passes through absolute (http) URLs,
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
 * — this helper keeps that consistent in one place.
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
 * Organization structured data — establishes the brand entity for Google's Knowledge Graph
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
    sameAs: [SITE.linkedIn],
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
 * ProfessionalService (a LocalBusiness subtype) — gives Google an explicit local
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
    sameAs: [SITE.linkedIn],
  };
}

/** WebSite structured data — enables sitelinks search box and names the site entity. */
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

/** BreadcrumbList structured data — drives breadcrumb rich results in SERPs. */
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
 * `openGraph` per route, so — like pageOpenGraph — every field is restated here. Uses
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
  };
}

/** Blog structured data — names the blog entity and lists its posts as an itemized feed. */
export function blogJsonLd(
  posts: { title: string; description: string; path: string; datePublished: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/blogs#blog`,
    name: `${SITE.name} Blog`,
    description:
      "Enterprise AI, staffing, cloud and MLOps insight for US B2B technology leaders — from the Techsara team.",
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

/** FAQPage structured data — surfaces an article's Q&A as eligible for FAQ rich results. */
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
