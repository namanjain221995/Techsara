import type { Metadata } from "next";
import { readdirSync } from "fs";
import { join } from "path";
import LegacyScripts from "@/components/LegacyScripts";
import SpectrumOfSolutions from "@/components/SpectrumOfSolutions";
import ContactCTASection from "@/components/ContactCTASection";
import HomeFaqSlider from "@/components/HomeFaqSlider";
import { getLegacyBody } from "@/lib/legacy-html";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  homeOfferCatalogJsonLd,
  homePageJsonLd,
  jsonLdScript,
  pageOpenGraph,
  SITE,
} from "@/lib/seo";

const title = "AI Development & IT Staffing Company USA | Techsara";
const description =
  "Techsara is a Frisco, TX AI development, IT staffing, and cloud consulting company for US enterprises. Build, deploy, and staff production AI.";

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

const HOME_FAQS = [
  {
    question: "What does Techsara Solutions do?",
    answer:
      "Techsara Solutions is a Frisco, Texas based AI development, IT staffing, and cloud consulting company for US enterprises. The team builds generative AI, LLM, computer vision, MLOps, cloud, on-premise, and edge AI systems and supplies senior engineering talent.",
  },
  {
    question: "Where is Techsara based?",
    answer:
      "Techsara is based in Frisco, Texas and serves enterprise teams across the United States and Canada.",
  },
  {
    question: "Which AI services does Techsara offer?",
    answer:
      "Techsara offers generative AI and LLM development, AI agents, computer vision, NLP, predictive ML, document AI, speech AI, recommendation systems, MLOps, cloud deployment, on-premise AI, hybrid edge AI, and AI strategy.",
  },
  {
    question: "How can companies work with Techsara?",
    answer:
      "Companies can hire direct talent, form dedicated delivery teams, or ask Techsara to deliver fixed-scope AI and software projects.",
  },
  {
    question: "Which industries does Techsara serve?",
    answer:
      "Techsara works with regulated, high-stakes industries including healthcare, finance, defense, retail, manufacturing, logistics, SaaS, and cloud platforms, with deployment options designed to meet HIPAA, SOC 2, and ISO 27001 requirements.",
  },
  {
    question: "Does Techsara offer on-premise or air-gapped AI deployment?",
    answer:
      "Yes. Techsara deploys AI in the cloud (AWS, Azure, GCP), on-premise, air-gapped, and hybrid edge environments, so regulated enterprises can keep sensitive data on their own hardware while running production AI.",
  },
  {
    question: "What AI technologies and platforms does Techsara use?",
    answer:
      "Techsara builds generative AI, RAG, fine-tuning, AI agents, computer vision, NLP, and MLOps systems, and deploys on AWS Bedrock, Google Vertex AI, Amazon SageMaker, and Azure OpenAI.",
  },
  {
    question: "How quickly can Techsara staff an AI or engineering team?",
    answer:
      "Techsara provides pre-vetted senior AI, ML, data, cloud, and software engineers and can stand up direct-hire placements or dedicated delivery teams that match enterprise timelines and onboarding requirements.",
  },
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

function HomeSeoFaq() {
  return (
    <section className="home-answer-section section-banded" aria-labelledby="home-answer-title">
      <div className="container home-answer-grid">
        <div className="home-answer-intro reveal">
          <span className="eyebrow">Common questions</span>
          <h2 id="home-answer-title" className="section-title">
            AI development and staffing, clearly defined.
          </h2>
          <p className="section-sub">
            Techsara helps US enterprises turn AI strategy into production systems and
            dependable teams, with delivery models for talent, managed teams, and
            fixed-scope projects.
          </p>
        </div>
        {/* Client slider, but the Q&A text still server-renders into the HTML —
            crawlers see every answer and it stays in sync with the FAQPage JSON-LD. */}
        <HomeFaqSlider faqs={HOME_FAQS} />
      </div>
    </section>
  );
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
  const jsonLd = [
    homePageJsonLd({ title, description }),
    homeOfferCatalogJsonLd(),
    breadcrumbJsonLd([{ name: "Home", path: "/" }]),
    faqPageJsonLd(HOME_FAQS),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {/* Preload the hero <video> poster — the homepage LCP element — at high priority. */}
      <link rel="preload" as="image" href="/uploads/hero_1.webp" fetchPriority="high" />
      <div dangerouslySetInnerHTML={{ __html: beforeSpectrum }} />
      <SpectrumOfSolutions />
      <div dangerouslySetInnerHTML={{ __html: betweenSpectrumAndCta }} />
      <HomeSeoFaq />
      <ContactCTASection />
      <div dangerouslySetInnerHTML={{ __html: afterCta }} />
      <LegacyScripts page="home" />
    </>
  );
}
