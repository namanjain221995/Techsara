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

  return nextHtml;
}
