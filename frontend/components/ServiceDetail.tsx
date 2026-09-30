import Link from "next/link";
import { getService, type Service } from "@/lib/services-data";

/**
 * The service detail page body, rendered on the server.
 *
 * This replaces the markup public/legacy/service.js used to inject into an empty
 * #service-root after load. Same classes and structure, so app/service.css needs
 * no changes - the difference is that the HTML now arrives with the content in
 * it, which removes the blank-page and false-404 races entirely and makes the
 * copy visible to crawlers that do not run JavaScript.
 */

const Arrow = ({ size = 16 }: { size?: number }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function RelatedCard({ slug }: { slug: string }) {
  const r = getService(slug);
  if (!r) return null;
  const intro = r.intro || "";
  const excerpt = intro.slice(0, 110) + (intro.length > 110 ? "…" : "");
  return (
    <article className="related-card reveal">
      <span className="service-cat" style={{ margin: 0 }}>{r.category}</span>
      <h4>{r.name}</h4>
      <p>{excerpt}</p>
      {/* Only "Explore" navigates, so only it carries the pointer cursor. */}
      <Link href={`/services/${slug}`} className="ar">
        Explore
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </article>
  );
}

export default function ServiceDetail({ data }: { data: Service }) {
  return (
    <main id="top">
      <section className="service-hero">
        <div className="hero-mesh" aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
        </div>
        <div className="grid-overlay" aria-hidden="true" />

        <div className="container">
          <div className="service-hero-grid">
            <div>
              <span className="service-cat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                </svg>
                {data.category}
              </span>
              <div className="service-name">{data.name}</div>
              <h1 className="service-title">{data.headline}</h1>
              <p className="service-intro">{data.intro}</p>
              <div className="service-hero-actions">
                <Link href="/book" className="btn btn-primary btn-lg">
                  Book a consultation
                  <Arrow />
                </Link>
              </div>
            </div>

            <aside className="service-aside reveal">
              <div className="service-aside-icon">
                {/* `icon` is authored as raw SVG paths in the catalogue. */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: data.icon }}
                />
              </div>
              <h4>What we deliver</h4>
              <div className="service-aside-metrics">
                {data.metrics.map((m) => (
                  <div className="service-aside-metric" key={m.lbl}>
                    <div className="num">{m.num}</div>
                    <div className="lbl">{m.lbl}</div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="container">
          <div className="detail-head reveal">
            <span className="eyebrow">Capabilities</span>
            <h2 className="section-title">What&apos;s inside this engagement.</h2>
            <p className="section-sub">
              Every project is composed from these capabilities - tuned to your data, your domain
              and your deployment target.
            </p>
          </div>
          <div className="cap-grid">
            {data.capabilities.map((c, i) => (
              <article className="cap reveal" data-delay={i % 4} key={c.title}>
                <div className="cap-num">CAP / {String(i + 1).padStart(2, "0")}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="detail-section surface">
        <div className="container service-stack-grid">
          <div className="reveal service-stack-col">
            <span className="eyebrow">Stack</span>
            <h2 className="section-title service-stack-title">Modern tools, used with intent.</h2>
            <p className="section-sub service-stack-sub">
              A curated stack chosen for production reliability - not novelty.
            </p>
            <div className="stack-chips">
              {data.stack.map((s) => (
                <span className="stack-chip" key={s}>{s}</span>
              ))}
            </div>
          </div>
          <div className="reveal service-delv-col" data-delay="1">
            <span className="eyebrow">Deliverables</span>
            <h3 className="section-title service-delv-title">
              Concrete artifacts at the end of every phase.
            </h3>
            <ul className="delv-list">
              {data.deliverables.map((d, i) => (
                <li className="reveal" data-delay={i % 4} key={d}>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="container">
          <div className="detail-head reveal">
            <span className="eyebrow">Related Services</span>
            <h2 className="section-title">Often delivered together.</h2>
          </div>
          <div className="related-grid">
            {data.related.map((slug) => (
              <RelatedCard slug={slug} key={slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner-wrap">
        <div className="container">
          <div className="service-deepdive-cta reveal">
            <p>Want a tailored proposal for {data.name}?</p>
            <Link href="/book" className="btn btn-primary">
              Book a free consultation
              <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
