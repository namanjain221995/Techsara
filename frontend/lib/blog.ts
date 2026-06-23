// ============================================
// TECHSARA — Blog domain model + helpers
// The blog is intentionally NOT linked from the site navigation; it exists as a
// crawlable, sitemap-listed SEO surface targeting US B2B search intent. Content lives
// in blog-data.ts; this module owns the types and the read/sort/derive helpers.
// ============================================

import { POSTS } from "@/lib/blog-data";

/** A single rendered content block. Paragraph/list text supports a tiny inline
 *  syntax — **bold** and [label](href) — expanded by the BlogContent renderer. */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title?: string; text: string }
  | { type: "quote"; text: string; cite?: string };

export type FAQ = { question: string; answer: string };

export type Author = {
  name: string;
  title: string;
  /** Two-letter initials for the avatar chip. */
  initials: string;
};

export type BlogCategory =
  | "AI Staffing"
  | "Generative AI"
  | "Cloud & MLOps"
  | "Industry Insights";

export type BlogPost = {
  slug: string;
  /** On-page H1. */
  title: string;
  /** <title> text — kept ≤ ~60 chars, US/geo-modified where natural. */
  seoTitle: string;
  /** Meta description — complete sentence, ~150–160 chars. */
  metaDescription: string;
  /** One- to two-sentence summary shown on cards and the listing hero. */
  excerpt: string;
  category: BlogCategory;
  /** Short label shown above the title (e.g. "AI Staffing"). */
  kicker: string;
  /** ISO date (YYYY-MM-DD). */
  publishedDate: string;
  /** ISO date; defaults to publishedDate when omitted. */
  modifiedDate?: string;
  author: Author;
  keywords: string[];
  /** 3–5 scannable key takeaways rendered in a highlighted box near the top. */
  takeaways: string[];
  blocks: Block[];
  faq: FAQ[];
  /** Background art key for the hero/card visual. */
  art: ArtKey;
};

export type ArtKey = "staffing" | "genai" | "cloud" | "industry";

const AVG_WPM = 220;

/** Count the words a reader actually sees (block text/items + takeaways + FAQ). */
function countWords(post: BlogPost): number {
  const strip = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
  let words = 0;
  const add = (s: string) => {
    words += strip(s).trim().split(/\s+/).filter(Boolean).length;
  };
  post.blocks.forEach((b) => {
    if ("text" in b && b.text) add(b.text);
    if ("items" in b && b.items) b.items.forEach(add);
  });
  post.takeaways.forEach(add);
  post.faq.forEach((f) => {
    add(f.question);
    add(f.answer);
  });
  return words;
}

export function wordCount(post: BlogPost): number {
  return countWords(post);
}

export function readingTime(post: BlogPost): number {
  return Math.max(3, Math.round(countWords(post) / AVG_WPM));
}

/** Human-readable US date, e.g. "March 5, 2026". Deterministic (UTC) to keep SSR/CSR in sync. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1));
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}

export function getPostBySlug(slug: string): BlogPost | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}

/** Up to `limit` related posts — same category first, then most recent — excluding `slug`. */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return getAllPosts().slice(0, limit);
  const others = getAllPosts().filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/** Slug-safe anchor id for an H2 heading (used by the in-page table of contents). */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Ordered list of H2 headings for the table of contents. Ids are de-duplicated in
 *  document order with the same scheme BlogContent uses, so every anchor resolves. */
export function tableOfContents(post: BlogPost): { id: string; text: string }[] {
  const seen = new Map<string, number>();
  return post.blocks
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map((b) => {
      const base = headingId(b.text);
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      return { id: n === 1 ? base : `${base}-${n}`, text: b.text };
    });
}
