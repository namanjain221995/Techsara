'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlogArt from "@/components/BlogArt";
import { getAllPosts, formatDate, readingTime } from "@/lib/blog";
import { breadcrumbJsonLd, blogJsonLd, jsonLdScript } from "@/lib/seo";

function getGradientForArt(art: string): string {
  const map: Record<string, string> = {
    staffing: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    genai:    'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
    cloud:    'linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)',
    industry: 'linear-gradient(135deg, #065f46 0%, #34d399 100%)',
  };
  return map[art] || map['staffing'];
}

const BLOG_ART_KEYS = ['staffing', 'genai', 'cloud', 'industry'] as const;

function getBlogArtFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return BLOG_ART_KEYS[Math.abs(hash) % BLOG_ART_KEYS.length];
}

function PostCard({ post, featured = false }: { post: any; featured?: boolean }) {
  return (
    <article className={`blog-card${featured ? " blog-card--featured" : ""}`}>
      <Link
        href={post._isS3 ? `/blogs/${post._s3Slug}` : `/blogs/${post.slug}`}
        className="blog-card-link"
        aria-label={post.title}
      >
        {post._isS3 ? (
          <div
            className={`blog-visual blog-visual--${post.coverImage ? '' : post.art}`}
            aria-hidden="true"
            style={post.coverImage ? { background: 'transparent' } : undefined}
          >
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <BlogArt art={post.art as any} />
            )}
          </div>
        ) : (
          <div className={`blog-visual blog-visual--${post.art}`} aria-hidden="true">
            <BlogArt art={post.art} />
          </div>
        )}
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
            {!post._isS3 && (
              <>
                <span className="blog-meta-dot" aria-hidden="true">·</span>
                <span>{readingTime(post)} min read</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogsPage() {
  const [s3Blogs, setS3Blogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setS3Blogs(
            data.blogs.filter((b: any) => b.status === 'published')
          );
        }
      })
      .catch(() => {});
  }, []);

  const posts = getAllPosts();

  const s3AsBlogPosts = s3Blogs.map((b: any) => ({
    slug: `__s3__${b.slug}`,
    title: b.title,
    excerpt: b.excerpt || '',
    category: b.category || '',
    kicker: b.kicker || '',
    publishedDate: b.publishedDate || b.createdAt?.split('T')[0] || '',
    author: b.author || { name: '', title: '', initials: '?' },
    art: b.art || getBlogArtFromId(b.id || b.slug || ''),
    coverImage: b.coverImage || '',
    _isS3: true,
    _s3Slug: b.slug,
    _s3Id: b.id,
  }));

  const allPosts = [...posts, ...s3AsBlogPosts].sort((a, b) => {
    const dateA = new Date(a.publishedDate).getTime();
    const dateB = new Date(b.publishedDate).getTime();
    return dateB - dateA;
  });

  const [featured, ...rest] = allPosts;

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
            Field notes from the teams who build and staff production AI - practical guidance on
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
            Techsara helps US enterprises ship production AI - with the talent, cloud and delivery
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
