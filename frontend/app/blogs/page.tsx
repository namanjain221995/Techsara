import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlogArt from "@/components/BlogArt";
import { getAllPosts, formatDate, readingTime, type BlogPost } from "@/lib/blog";
import { pageOpenGraph, breadcrumbJsonLd, blogJsonLd, jsonLdScript } from "@/lib/seo";

const title = "Techsara Blog | Enterprise AI & Staffing Insights";
const description =
  "Practical insight on enterprise AI, IT staffing, cloud, MLOps and industry use cases for US B2B technology leaders — from the Techsara team.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/blogs" },
  openGraph: pageOpenGraph({ title, description, path: "/blogs" }),
};

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={`blog-card${featured ? " blog-card--featured" : ""}`}>
      <Link href={`/blogs/${post.slug}`} className="blog-card-link" aria-label={post.title}>
        <div className={`blog-visual blog-visual--${post.art}`} aria-hidden="true">
          <BlogArt art={post.art} />
        </div>
        <div className="blog-card-body">
          <span className="blog-chip">{post.category}</span>
          <h3 className="blog-card-title">{post.title}</h3>
          <p className="blog-card-excerpt">{post.excerpt}</p>
          <div className="blog-card-meta">
            <span className="blog-card-author">
              <span className="blog-avatar" aria-hidden="true">{post.author.initials}</span>
              {post.author.name}
            </span>
            <span className="blog-meta-dot" aria-hidden="true">·</span>
            <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
            <span className="blog-meta-dot" aria-hidden="true">·</span>
            <span>{readingTime(post)} min read</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogsPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blogs" },
    ]),
    blogJsonLd(
      posts.map((p) => ({
        title: p.title,
        description: p.excerpt,
        path: `/blogs/${p.slug}`,
        datePublished: p.publishedDate,
      })),
    ),
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
          <p className="eyebrow">Techsara Insights</p>
          <h1>Enterprise AI, staffing &amp; cloud insight for US technology leaders</h1>
          <p className="blog-hero-sub">
            Field notes from the teams who build and staff production AI — practical guidance on
            hiring AI talent, generative AI adoption, cloud and MLOps economics, and applied
            use cases across regulated US industries.
          </p>
        </div>
      </section>

      <section className="blog-listing">
        <div className="container">
          {featured ? (
            <>
              <h2 className="blog-section-label">Latest</h2>
              <PostCard post={featured} featured />
            </>
          ) : null}

          {rest.length ? (
            <>
              <h2 className="blog-section-label">More articles</h2>
              <div className="blog-grid">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="blog-cta">
        <div className="container blog-cta-inner">
          <h2>Have a project that needs the right team?</h2>
          <p>
            Techsara helps US enterprises ship production AI — with the talent, cloud and delivery
            model to match. Let&apos;s map the fastest path for your roadmap.
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
