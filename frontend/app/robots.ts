import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// API routes and the internal print view carry no search value.
const DISALLOW = ["/api/", "/print"];

// AI search & assistant crawlers, named explicitly so the welcome is unambiguous.
// A bot that matches a named group ignores the "*" group entirely, so each one
// must restate the disallow list. Spans answer engines (OAI-SearchBot,
// Perplexity, DuckAssist), assistant fetchers (ChatGPT-User, Claude-User) and
// training crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended) -
// brand presence inside AI answers is a deliberate goal, so all are allowed.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "DuckAssistBot",
  "Amazonbot",
  "meta-externalagent",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
