import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AboutFaqClient from "@/components/AboutFaqClient";
import {
  aboutPageJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
  pageOpenGraph,
} from "@/lib/seo";

const title = "About Techsara | AI Development & IT Staffing Company, Frisco TX";
const description =
  "About Techsara Solutions - a Frisco, Texas AI development, IT staffing, and cloud consulting company founded in 2021. How we build and deploy production AI and staff senior engineering teams for US enterprises.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph({ title, description, path: "/about" }),
};

const FAQS = [
  {
    question: "What is Techsara?",
    answer:
      "Techsara helps US enterprises turn AI strategy into production systems and dependable teams, with delivery models for talent, managed teams, and fixed-scope projects.",
  },
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

export default function AboutPage() {
  const jsonLd = [
    aboutPageJsonLd({ title, description }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  ];

  return (
    <main className="abt-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <SiteHeader />

      {/* ── STORY HERO ── */}
      <section className="abt-story" id="story">
        <div className="container abt-story-grid">
          <div className="abt-story-left">
            <p className="abt-eyebrow">Our Story</p>
            <h1 className="abt-h1">
              Built for <span>sustained execution.</span>
            </h1>
            <div className="abt-facts">
              <div className="abt-fact">
                <b>2021</b>
                <span>Founded</span>
              </div>
              <div className="abt-fact">
                <b>Frisco, TX</b>
                <span>Headquarters</span>
              </div>
              <div className="abt-fact">
                <b>US + Canada</b>
                <span>Enterprise focus</span>
              </div>
            </div>
          </div>

          <div className="abt-story-right">
            <p className="abt-opening">
              Techsara is a Frisco, Texas AI development and IT staffing company built for US
              enterprises that are ready to move from pilot to production and need the engineering
              talent to keep it running.
            </p>
            <div className="abt-story-line" />
            <div className="abt-body">
              <p>
                Most AI companies do one thing well — they either build systems or supply talent.
                Techsara was founded on a different belief: that the hardest part of enterprise AI
                isn&apos;t the model, it&apos;s sustained execution.
              </p>
              <p>
                We saw enterprises spending months finding the right engineers after a project
                launched — losing momentum, losing context, losing value. So we built a firm where
                the team that architects your AI system can also be the team that runs it long-term.
              </p>
              <p>
                From Frisco, Texas, we serve enterprise teams across the US and Canada, deploying
                production AI across cloud, on-premise, and hybrid environments and staffing the
                senior engineers who sustain them.
              </p>
            </div>
            <blockquote className="abt-quote">
              &ldquo;The hardest part of enterprise AI isn&apos;t the model, it&apos;s sustained
              execution.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ── */}
      <section className="abt-founders" id="founder">
        <div className="container">
          <div className="abt-editorial-head">
            <div>
              <p className="abt-eyebrow">About the Founders</p>
              <h2 className="abt-h2">The leadership behind Techsara.</h2>
            </div>
            <p className="abt-founders-sub">
              Techsara was founded by Sahil Patel and Rajvi Patel, bringing together two
              complementary perspectives behind the company&apos;s technology, talent, and growth
              journey.
            </p>
          </div>

          {/* Sahil — visual left, story right */}
          <div className="abt-founder-profile">
            <div className="abt-founder-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/uploads/CEO.webp"
                alt="Sahil Patel"
                className="abt-founder-photo"
              />
              <div className="abt-portrait-caption">
                <span>01</span>
                <div>
                  <strong>Sahil Patel</strong>
                  <small>Founder &amp; CEO &middot; Techsara Solutions</small>
                </div>
              </div>
            </div>
            <div className="abt-founder-story">
              <div className="abt-founder-index">01</div>
              <p className="abt-eyebrow">Founder &amp; CEO</p>
              <h3 className="abt-founder-h3">Sahil Patel</h3>
              <div className="abt-founder-bio">
                <p>
                  Sahil Patel founded Techsara Solutions in 2021 and leads the company as Founder
                  &amp; CEO.
                </p>
                <p>
                  His leadership positioning centres on creating impact through employment, while
                  Techsara has evolved around a combined model of enterprise technology delivery,
                  AI capability, and specialist talent.
                </p>
                <p>
                  The company&apos;s operating belief is simple: businesses should not have to choose
                  between the team that understands the technology and the team that can find the
                  people required to sustain it.
                </p>
              </div>
              <div className="abt-founder-rule" />
              <div className="abt-founder-sig">
                <div className="abt-sig-mark">SP</div>
                <div>
                  <small>Founder &amp; CEO</small>
                  <strong>Sahil Patel</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="abt-founder-divider">
            <span /><small>TWO PERSPECTIVES &middot; ONE COMPANY</small><span />
          </div>

          {/* Rajvi — story left, visual right */}
          <div className="abt-founder-profile abt-founder-profile--flip">
            <div className="abt-founder-story">
              <div className="abt-founder-index">02</div>
              <p className="abt-eyebrow abt-eyebrow--cyan">Co-Founder</p>
              <h3 className="abt-founder-h3">Rajvi Patel</h3>
              <div className="abt-founder-bio">
                <p>
                  Rajvi Patel co-founded Techsara Solutions and has been part of the
                  company&apos;s leadership journey from its foundation.
                </p>
                <p>
                  Her professional positioning focuses on helping people navigate an increasingly
                  competitive job market, with an emphasis on career opportunity, recruitment
                  transparency, and the human side of hiring.
                </p>
                <p>
                  That people-first perspective complements Techsara&apos;s technology and enterprise
                  focus, reinforcing the company&apos;s belief that successful growth comes from
                  connecting businesses with the right capability while creating meaningful
                  opportunities for the people behind it.
                </p>
              </div>
              <div className="abt-founder-rule abt-founder-rule--cyan" />
              <div className="abt-founder-sig">
                <div className="abt-sig-mark abt-sig-mark--rajvi">RP</div>
                <div>
                  <small>Co-Founder</small>
                  <strong>Rajvi Patel</strong>
                </div>
              </div>
            </div>
            <div className="abt-founder-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/uploads/COO.webp"
                alt="Rajvi Patel"
                className="abt-founder-photo"
              />
              <div className="abt-portrait-caption abt-portrait-caption--cyan">
                <span>02</span>
                <div>
                  <strong>Rajvi Patel</strong>
                  <small>Co-Founder &middot; Techsara Solutions</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="abt-faq" id="faq">
        <div className="container">
          <div className="abt-faq-head">
            <h2 className="abt-faq-h2">Common Questions</h2>
          </div>
          <AboutFaqClient faqs={FAQS} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
