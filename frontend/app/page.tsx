import type { Metadata } from "next";
import { readdirSync } from "fs";
import { join } from "path";
import LegacyScripts from "@/components/LegacyScripts";
import SpectrumOfSolutions from "@/components/SpectrumOfSolutions";
import ContactCTASection from "@/components/ContactCTASection";
import { getLegacyBody } from "@/lib/legacy-html";
import {
  breadcrumbJsonLd,
  homeOfferCatalogJsonLd,
  homePageJsonLd,
  jsonLdScript,
  pageOpenGraph,
  SITE,
} from "@/lib/seo";

const title = "AI Development & IT Staffing Company USA | Techsara";
const description =
  "Techsara is a Frisco, TX AI development, IT staffing, and cloud consulting company for US enterprises. We build and deploy production AI solutions and staff senior cloud and software engineering teams.";

const keywords = [
  "AI development company USA",
  "IT staffing company USA",
  "AI staffing company",
  "Frisco Texas AI company",
  "generative AI development",
  "LLM development company",
  "MLOps consulting",
  "cloud AI deployment",
  "on-premise AI deployment",
  "enterprise AI consulting",
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords,
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({
    title,
    description,
    path: "/",
  }),
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: SITE.twitter,
    creator: SITE.twitter,
    images: ["/assets/og-image.png"],
  },
  other: {
    "geo.region": "US-TX",
    "geo.placename": "Frisco, Texas",
    "business:contact_data:locality": "Frisco",
    "business:contact_data:region": "TX",
    "business:contact_data:country_name": "United States",
    "ai-site-summary":
      "Techsara is a US AI development, IT staffing, cloud, MLOps, on-premise AI, and enterprise technology consulting company.",
  },
};

const SPECTRUM_PLACEHOLDER = "<!-- TECHSARA_SPECTRUM_PLACEHOLDER -->";
const CONTACT_CTA_PLACEHOLDER =
  "<!-- TECHSARA_CONTACT_CTA_PLACEHOLDER - replaced server-side by <ContactCTASection /> (embedded contact form) -->";
const LOGOS_PLACEHOLDER =
  "<!-- TECHSARA_LOGOS_PLACEHOLDER - populated server-side from /public/logo at build time -->";

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function getLogos() {
  const logoDir = join(process.cwd(), "public", "logo");
  try {
    // List source images (png/jpg/svg) - NOT the generated .webp siblings, or each logo
    // would appear twice. png/jpg are then served as their WebP version.
    const files = readdirSync(logoDir)
      .filter((f) => /\.(png|jpe?g|svg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));
    // Render each logo ONCE in the shipped HTML - halving the bytes vs. the old items+items
    // duplication (the dominant contributor to the "HTML Page Size" audit failure). The
    // seamless -50% marquee keyframe needs the set doubled, so a tiny runtime script clones
    // the track after parse (see HomePage) - keeping the second copy out of the shipped HTML.
    // width/height 171×56 matches the true 256×84 source ratio at the CSS height:56px,
    // eliminating the declared-vs-rendered aspect-ratio mismatch (and CLS).
    const items = files
      .map((file) => {
        const name = file.replace(/\.[^.]+$/, "");
        const src = file.replace(/\.(png|jpe?g)$/i, ".webp");
        return `<span class="marquee-logo"><img src="/logo/${encodeURIComponent(src)}" alt="${escapeAttr(name)} logo" loading="lazy" decoding="async" fetchpriority="low" width="171" height="56"/></span>`;
      })
      .join("");
    return { items, count: files.length };
  } catch {
    return { items: "", count: 0 };
  }
}

const HOW_WE_WORK_STEPS = [
  {
    name: "Discovery & Scoping",
    text: "We clarify the business problem, success metrics, available data, and constraints — security, compliance, and deployment target — before any build begins.",
  },
  {
    name: "Architecture & Evaluation Design",
    text: "We choose the model and approach, define an evaluation harness with explicit acceptance criteria, and plan the deployment topology: cloud, on-premise, air-gapped, or hybrid edge.",
  },
  {
    name: "Iterative Build with Eval Gates",
    text: "We develop in short cycles with human-in-the-loop evaluation gates, so accuracy and quality are measured continuously rather than assumed.",
  },
  {
    name: "Security & Governance Review",
    text: "We apply the controls regulated workloads require, with data handling designed to meet HIPAA, SOC 2, and ISO 27001 requirements.",
  },
  {
    name: "Production Deployment & MLOps",
    text: "We ship with monitoring, observability, CI/CD for models, and cost optimization so the system stays reliable and affordable in production.",
  },
  {
    name: "Handover & Support",
    text: "The same engineers who scope the work ship it, with post-launch support and knowledge transfer to your team.",
  },
];

function HowWeWorkSection() {
  return (
    <section className="home-how-we-work" aria-labelledby="how-we-work-title">
      <div className="container hww-shell">
        <div className="hww-intro reveal">
          <div className="hww-eyebrow">Our Process</div>
          <p id="how-we-work-title" className="hww-heading">How we work</p>
          <p className="hww-sub">
            We follow the same production-first method on every engagement, so quality is
            measured, not assumed.
          </p>
        </div>
        <ol className="hww-timeline">
          {HOW_WE_WORK_STEPS.map((step, i) => (
            <li key={step.name} className="hww-step reveal">
              <div className="hww-card">
                <div className="hww-num">{`0${i + 1}`}</div>
                <h3 className="hww-name">{step.name}</h3>
                <p className="hww-text">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { items, count } = getLogos();
  // ~2.8 seconds per logo keeps a constant comfortable pixel-speed regardless of how many files are in /public/logo/
  const duration = Math.max(60, Math.round(count * 2.8));

  let body = getLegacyBody("index.html").replace(LOGOS_PLACEHOLDER, items);
  body = body.replace(
    '<div class="marquee-track">',
    `<div class="marquee-track" style="animation-duration: ${duration}s;">`,
  );

  const [beforeSpectrum, afterSpectrum = ""] = body.split(SPECTRUM_PLACEHOLDER);
  // The CTA banner lives after the spectrum section - split again to swap it for the
  // React-driven section that embeds the live contact form on the right.
  const [betweenSpectrumAndCta, afterCta = ""] = afterSpectrum.split(CONTACT_CTA_PLACEHOLDER);
  // Split betweenSpectrumAndCta at Industries so HowWeWorkSection (Our Process) renders first.
  const INDUSTRIES_MARKER = '<section id="industries">';
  const industriesIdx = betweenSpectrumAndCta.indexOf(INDUSTRIES_MARKER);
  const beforeIndustries = industriesIdx >= 0 ? betweenSpectrumAndCta.slice(0, industriesIdx) : betweenSpectrumAndCta;
  const fromIndustries = industriesIdx >= 0 ? betweenSpectrumAndCta.slice(industriesIdx) : "";
  const jsonLd = [
    homePageJsonLd({ title, description }),
    homeOfferCatalogJsonLd(),
    breadcrumbJsonLd([{ name: "Home", path: "/" }]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {/* Preload the hero video - the homepage LCP element - at high priority. */}
      <link rel="preload" as="video" href="/uploads/q2-2025-homepage.mp4" type="video/mp4" />
      {/* suppressHydrationWarning: this subtree is legacy HTML React never reconciles.
          Two things make React's string comparison fail even though the DOM is correct -
          the source uses self-closing tags (<stop />) which the browser re-serialises as
          <stop></stop>, and the marquee script below clones nodes before hydration. */}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: beforeSpectrum }} />
      {/* Hero 3D tilt — applied to #heroPhoto wrapper via #heroMedia mousemove */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;var hero=document.getElementById('heroMedia');var photo=document.getElementById('heroPhoto');if(!reduce&&hero&&photo){hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-0.5;var y=(e.clientY-r.top)/r.height-0.5;photo.style.transform='perspective(900px) rotateY('+(x*4)+'deg) rotateX('+(-y*3)+'deg) scale(1.01)';});hero.addEventListener('mouseleave',function(){photo.style.transform='';});}})();",
        }}
      />
      {/* The logo marquee ships each logo once; restore the doubled track the -50% keyframe
          needs by cloning at parse time. Runs immediately after the marquee is parsed (the
          element lives inside the dangerouslySetInnerHTML above, which React never reconciles),
          so there is no animation jump and no second copy in the shipped HTML. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var t=document.querySelectorAll('.marquee-track');for(var i=0;i<t.length;i++){if(t[i].getAttribute('data-cloned')==='1')continue;t[i].setAttribute('data-cloned','1');t[i].insertAdjacentHTML('beforeend',t[i].innerHTML);}})();",
        }}
      />
      <SpectrumOfSolutions />
      <HowWeWorkSection />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: beforeIndustries }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: fromIndustries }} />
      <ContactCTASection />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: afterCta }} />
      <LegacyScripts page="home" />
    </>
  );
}
