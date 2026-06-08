import type { Metadata } from "next";
import { readdirSync } from "fs";
import { join } from "path";
import LegacyScripts from "@/components/LegacyScripts";
import SpectrumOfSolutions from "@/components/SpectrumOfSolutions";
import ContactCTASection from "@/components/ContactCTASection";
import { getLegacyBody } from "@/lib/legacy-html";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Techsara delivers AI development, IT staffing, and cloud solutions for enterprise teams across the United States. Based in Frisco, TX. Book a free consultation.";

export const metadata: Metadata = {
  title: { absolute: "Techsara | AI Staffing & Technology Solutions — USA" },
  description,
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({
    title: "Techsara | AI Staffing & Technology Solutions — USA",
    description,
    path: "/",
  }),
};

const SPECTRUM_PLACEHOLDER = "<!-- TECHSARA_SPECTRUM_PLACEHOLDER -->";
const CONTACT_CTA_PLACEHOLDER =
  "<!-- TECHSARA_CONTACT_CTA_PLACEHOLDER — replaced server-side by <ContactCTASection /> (embedded contact form) -->";
const LOGOS_PLACEHOLDER =
  "<!-- TECHSARA_LOGOS_PLACEHOLDER — populated server-side from /public/logo at build time -->";

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function getLogos() {
  const logoDir = join(process.cwd(), "public", "logo");
  try {
    // List source images (png/jpg/svg) — NOT the generated .webp siblings, or each logo
    // would appear twice. png/jpg are then served as their WebP version.
    const files = readdirSync(logoDir)
      .filter((f) => /\.(png|jpe?g|svg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));
    const items = files
      .map((file) => {
        const alt = file.replace(/\.[^.]+$/, "");
        const src = file.replace(/\.(png|jpe?g)$/i, ".webp");
        return `<span class="marquee-logo"><img src="/logo/${encodeURIComponent(src)}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async" fetchpriority="low" width="120" height="40"/></span>`;
      })
      .join("");
    // Duplicate for seamless marquee loop
    return { items: items + items, count: files.length };
  } catch {
    return { items: "", count: 0 };
  }
}

export default function HomePage() {
  const { items, count } = getLogos();
  // ~1.4 seconds per logo keeps a constant comfortable pixel-speed regardless of how many files are in /public/logo/
  const duration = Math.max(30, Math.round(count * 1.4));

  let body = getLegacyBody("index.html").replace(LOGOS_PLACEHOLDER, items);
  body = body.replace(
    '<div class="marquee-track">',
    `<div class="marquee-track" style="animation-duration: ${duration}s;">`,
  );

  const [beforeSpectrum, afterSpectrum = ""] = body.split(SPECTRUM_PLACEHOLDER);
  // The CTA banner lives after the spectrum section — split again to swap it for the
  // React-driven section that embeds the live contact form on the right.
  const [betweenSpectrumAndCta, afterCta = ""] = afterSpectrum.split(CONTACT_CTA_PLACEHOLDER);

  return (
    <>
      {/* Preload the hero <video> poster — the homepage LCP element — at high priority. */}
      <link rel="preload" as="image" href="/uploads/hero_1.webp" fetchPriority="high" />
      <div dangerouslySetInnerHTML={{ __html: beforeSpectrum }} />
      <SpectrumOfSolutions />
      <div dangerouslySetInnerHTML={{ __html: betweenSpectrumAndCta }} />
      <ContactCTASection />
      <div dangerouslySetInnerHTML={{ __html: afterCta }} />
      <LegacyScripts page="home" />
    </>
  );
}
