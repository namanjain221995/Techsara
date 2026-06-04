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
  telephone: "+13234866123",
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
