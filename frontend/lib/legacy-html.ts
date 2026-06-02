import { readFileSync } from "fs";
import { join } from "path";

const SERVICE_HASH_MAP: Record<string, string> = {
  genai: "generative-ai",
  ml: "computer-vision",
  agents: "ai-agents",
};

function contentPath(fileName: string) {
  return join(process.cwd(), "content", fileName);
}

export function getLegacyBody(fileName: string) {
  const html = readFileSync(contentPath(fileName), "utf8");
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;

  return rewriteLegacyLinks(
    body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").trim(),
  );
}

export function getServiceSlugs() {
  const source = readFileSync(contentPath("service-data.js"), "utf8");
  return [...source.matchAll(/^\s*"([^"]+)":\s*\{/gm)].map((match) => match[1]);
}

export type ServiceMeta = { name: string; intro: string; category: string };

/**
 * Pull the human-readable name/intro/category for a service slug out of service-data.js
 * so the /solutions/[slug] pages get real, keyword-rich titles & descriptions instead of
 * a generic placeholder. Returns null for unknown slugs.
 */
export function getServiceMeta(slug: string): ServiceMeta | null {
  const source = readFileSync(contentPath("service-data.js"), "utf8");
  // Isolate just this slug's object block (up to the next top-level slug key).
  const block = source.match(
    new RegExp(`"${slug}":\\s*\\{([\\s\\S]*?)\\n\\s{2}\\}`, "m"),
  );
  if (!block) return null;
  const body = block[1];
  const pick = (key: string) => {
    const m = body.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1].replace(/\\"/g, '"') : "";
  };
  const name = pick("name");
  if (!name) return null;
  return {
    name,
    intro: pick("intro"),
    category: pick("category") || "AI Service",
  };
}

// First couple of images on every page are the brand-logo in the header.
// Everything else (team portraits, hero images, footer marks, etc.) sits
// well below the fold or appears late, so we lazy-load by default.
const EAGER_IMG_HINTS = ["brand-logo"];

function shouldEagerLoad(tag: string) {
  return EAGER_IMG_HINTS.some((hint) => tag.includes(hint));
}

function optimizeImgTags(html: string) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let next = tag;

    // Skip when the author has explicitly set loading=
    if (!/\sloading\s*=/.test(next)) {
      const loading = shouldEagerLoad(next) ? "eager" : "lazy";
      next = next.replace(/<img\b/, `<img loading="${loading}"`);
    }

    if (!/\sdecoding\s*=/.test(next)) {
      next = next.replace(/<img\b/, '<img decoding="async"');
    }

    // Brand-logo gets high priority so first paint feels instant; everything
    // else gets low fetchpriority so the browser deprioritises it behind
    // the hero text / video / fonts.
    if (!/\sfetchpriority\s*=/.test(next)) {
      const priority = shouldEagerLoad(next) ? "high" : "low";
      next = next.replace(/<img\b/, `<img fetchpriority="${priority}"`);
    }

    return next;
  });
}

function rewriteLegacyLinks(html: string) {
  let nextHtml = html;

  nextHtml = nextHtml.replace(/href="service\.html#([^"]+)"/g, (_, hash: string) => {
    const slug = SERVICE_HASH_MAP[hash] || "generative-ai";
    return `href="/solutions/${slug}"`;
  });

  nextHtml = nextHtml.replace(/href="service\.html\?slug=([^"#]+)"/g, (_, slug: string) => {
    return `href="/solutions/${slug}"`;
  });

  nextHtml = nextHtml
    .replace(/href="index\.html#services"/g, 'href="/services"')
    .replace(/href="#services"/g, 'href="/services"')
    .replace(/href="book\.html/g, 'href="/book')
    .replace(/href="index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="assets\//g, 'href="/assets/')
    .replace(/src="assets\//g, 'src="/assets/')
    .replace(/href="uploads\//g, 'href="/uploads/')
    .replace(/src="uploads\//g, 'src="/uploads/');

  return optimizeImgTags(nextHtml);
}
