import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  SITE,
  HOME_SERVICE_OFFERINGS,
  aboutPageJsonLd,
  howToJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
  pageOpenGraph,
} from "@/lib/seo";

const title = "About Techsara | AI Development & IT Staffing Company, Frisco TX";
const description =
  "About Techsara Solutions — a Frisco, Texas AI development, IT staffing, and cloud consulting company founded in 2021. How we build and deploy production AI and staff senior engineering teams for US enterprises.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph({ title, description, path: "/about" }),
};

// Single source of truth for the delivery methodology — rendered visibly AND emitted as
// HowTo structured data, so the on-page process and the machine-readable schema stay in sync.
const METHODOLOGY: { name: string; text: string }[] = [
  {
    name: "Discovery & scoping",
    text: "We clarify the business problem, success metrics, available data, and constraints — security, compliance, and deployment target — before any build begins.",
  },
  {
    name: "Architecture & evaluation design",
    text: "We choose the model and approach, define an evaluation harness with explicit acceptance criteria, and plan the deployment topology: cloud, on-premise, air-gapped, or hybrid edge.",
  },
  {
    name: "Iterative build with eval gates",
    text: "We develop in short cycles with human-in-the-loop evaluation gates, so accuracy and quality are measured continuously rather than assumed.",
  },
  {
    name: "Security & governance review",
    text: "We apply the controls regulated workloads require, with data handling designed to meet HIPAA, SOC 2, and ISO 27001 requirements.",
  },
  {
    name: "Production deployment & MLOps",
    text: "We ship with monitoring, observability, CI/CD for models, and cost optimization so the system stays reliable and affordable in production.",
  },
  {
    name: "Handover & support",
    text: "The same engineers who scope the work ship it, with post-launch support and knowledge transfer to your team.",
  },
];

// Real, named team members go here when the owner supplies them (name, title, bio, photo,
// LinkedIn). Left empty deliberately — never publish fabricated people. When populated, the
// team section renders and Person schema should be emitted via personJsonLd().
const TEAM: { name: string; title: string; bio: string }[] = [];

export default function AboutPage() {
  const jsonLd = [
    aboutPageJsonLd({ title, description }),
    howToJsonLd({
      name: "How Techsara delivers production AI",
      description:
        "Techsara's production-first delivery method for enterprise AI engagements, from discovery to post-launch support.",
      steps: METHODOLOGY,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  ];

  return (
    <main className="blog-page trends-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <SiteHeader />

      <section className="blog-hero">
        <div className="container blog-hero-inner">
          <p className="eyebrow">About Techsara</p>
          <h1>AI development, cloud engineering &amp; IT staffing for US enterprises</h1>
          <p className="blog-hero-sub">
            Techsara Solutions is a Frisco, Texas based AI development, IT staffing, and cloud
            consulting company. Founded in 2021, we help enterprises across the United States and
            Canada build, deploy, and staff production AI — in the cloud, on-premise, or at the edge.
          </p>
        </div>
      </section>

      <section className="blog-listing">
        <div className="container">
          <h2 className="blog-section-label">What we do</h2>
          <p>
            We combine hands-on AI engineering with senior talent so enterprises can move from AI
            strategy to dependable production systems. Our work spans generative AI and LLMs,
            computer vision, MLOps, and cloud, on-premise, and edge deployment, backed by direct-hire
            placement, managed delivery teams, and fixed-scope project delivery.
          </p>
          <ul className="about-offerings">
            {HOME_SERVICE_OFFERINGS.map((offering) => (
              <li key={offering.path}>
                <Link href={offering.path}>{offering.name}</Link> — {offering.description}
              </li>
            ))}
          </ul>
          <p>
            Explore the full catalog of <Link href="/solutions">AI solutions</Link> and{" "}
            <Link href="/services">staffing and delivery services</Link>.
          </p>
        </div>
      </section>

      <section className="blog-listing">
        <div className="container">
          <h2 className="blog-section-label">How we work</h2>
          <p>
            We follow the same production-first method on every engagement, so quality is measured,
            not assumed:
          </p>
          <ol className="about-methodology">
            {METHODOLOGY.map((step) => (
              <li key={step.name}>
                <strong>{step.name}.</strong> {step.text}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="blog-listing">
        <div className="container">
          <h2 className="blog-section-label">Company facts</h2>
          <ul className="about-facts">
            <li>Founded: 2021</li>
            <li>
              Headquarters: {SITE.address.addressLocality}, {SITE.address.addressRegion}, USA
            </li>
            <li>Serves: enterprise teams across the United States and Canada</li>
            <li>
              Focus: enterprise AI development, MLOps, cloud and on-premise deployment, and senior
              IT staffing
            </li>
            <li>
              Industries: healthcare, finance, defense, retail, manufacturing, logistics, SaaS, and
              cloud platforms
            </li>
          </ul>
        </div>
      </section>

      {TEAM.length ? (
        <section className="blog-listing">
          <div className="container">
            <h2 className="blog-section-label">Leadership &amp; team</h2>
            <div className="about-team-grid">
              {TEAM.map((member) => (
                <div key={member.name} className="about-team-card">
                  <h3>{member.name}</h3>
                  <p className="about-team-role">{member.title}</p>
                  <p>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="blog-cta">
        <div className="container blog-cta-inner">
          <h2>Work with Techsara</h2>
          <p>
            Tell us what you&apos;re building. We&apos;ll map the fastest, most accountable path —
            with the talent, cloud, and delivery model to match your roadmap.
          </p>
          <div className="blog-cta-actions">
            <Link href="/book" className="btn btn-primary btn-lg">
              Book a consultation
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/contact" className="btn btn-ghost btn-lg">Contact us</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
