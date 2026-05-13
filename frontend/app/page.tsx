import { readdirSync } from "fs";
import { join } from "path";
import LegacyScripts from "@/components/LegacyScripts";
import SpectrumOfSolutions from "@/components/SpectrumOfSolutions";
import { getLegacyBody } from "@/lib/legacy-html";

const SPECTRUM_PLACEHOLDER = "<!-- TECHSARA_SPECTRUM_PLACEHOLDER -->";
const LOGOS_PLACEHOLDER =
  "<!-- TECHSARA_LOGOS_PLACEHOLDER — populated server-side from /public/logo at build time -->";

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function getLogos() {
  const logoDir = join(process.cwd(), "public", "logo");
  try {
    const files = readdirSync(logoDir)
      .filter((f) => /\.(png|jpe?g|svg|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));
    const items = files
      .map((file) => {
        const alt = file.replace(/\.[^.]+$/, "");
        return `<span class="marquee-logo"><img src="/logo/${encodeURIComponent(file)}" alt="${escapeAttr(alt)}" decoding="async" fetchpriority="low"/></span>`;
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

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: beforeSpectrum }} />
      <SpectrumOfSolutions />
      <div dangerouslySetInnerHTML={{ __html: afterSpectrum }} />
      <LegacyScripts page="home" />
    </>
  );
}
