import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlogArt from "@/components/BlogArt";
import BlogContent from "@/components/BlogContent";
import {
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
  formatDate,
  readingTime,
  wordCount,
  tableOfContents,
} from "@/lib/blog";
import {
  articleOpenGraph,
  blogPostingJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  jsonLdScript,
} from "@/lib/seo";
import { readFromS3 } from "@/lib/s3";

async function fetchS3BlogBySlug(slug: string): Promise<{
  article: any;
  content: string;
} | null> {
  try {
    const raw = await readFromS3('blogs/index.json');
    const blogs = JSON.parse(raw || '[]');
    const found = blogs.find(
      (b: any) => b.slug === slug && b.status === 'published'
    );
    if (!found) return null;
    const content = await readFromS3(`blogs/${found.id}/content.html`);
    return { article: found, content };
  } catch {
    return null;
  }
}

function stripImages(html: string): string {
  if (!html) return '';
  // Only strip Salesforce internal images (file.force.com)
  // S3 images and other public images are kept and displayed
  return html.replace(
    /<img[^>]*src="[^"]*file\.force\.com[^"]*"[^>]*\/?>/gi,
    ''
  );
}

function getGradientForArt(art: string): string {
  const map: Record<string, string> = {
    staffing: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    genai:    'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
    cloud:    'linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)',
    industry: 'linear-gradient(135deg, #065f46 0%, #34d399 100%)',
  };
  return map[art] || map['staffing'];
}

type PostPageProps = { params: { slug: string } };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (post) {
    const path = `/blogs/${post.slug}`;
    return {
      title: { absolute: `${post.seoTitle} | Techsara` },
      description: post.metaDescription,
      keywords: post.keywords,
      authors: [{ name: post.author.name }],
      alternates: { canonical: path },
      openGraph: articleOpenGraph({
        title: post.title,
        description: post.metaDescription,
        path,
        publishedTime: post.publishedDate,
        modifiedTime: post.modifiedDate,
        authorName: post.author.name,
        tags: post.keywords,
      }),
    };
  }

  const s3Data = await fetchS3BlogBySlug(params.slug);
  if (!s3Data) return { title: { absolute: "Article Not Found | Techsara" } };

  const { article } = s3Data;
  const path = `/blogs/${article.slug}`;
  return {
    title: { absolute: `${article.title} | Techsara` },
    description: article.excerpt || '',
    authors: article.author?.name ? [{ name: article.author.name }] : [],
    alternates: { canonical: path },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);

  if (post) {
  const path = `/blogs/${post.slug}`;
  const toc = tableOfContents(post);
  const related = getRelatedPosts(post.slug, 3);

  const jsonLd = [
    blogPostingJsonLd({
      title: post.title,
      description: post.metaDescription,
      path,
      publishedDate: post.publishedDate,
      modifiedDate: post.modifiedDate,
      authorName: post.author.name,
      authorTitle: post.author.title,
      keywords: post.keywords,
      section: post.category,
      wordCount: wordCount(post),
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blogs" },
      { name: post.title, path },
    ]),
    faqPageJsonLd(post.faq),
  ];

  return (
    <main className="blog-page blog-post-page trends-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <SiteHeader />

      <article className="blog-post">
        <header className={`blog-post-hero blog-visual--${post.art}`}>
          <div className="blog-post-hero-art" aria-hidden="true">
            <BlogArt art={post.art} />
          </div>
          <div className="container blog-post-hero-inner">
            <nav className="blog-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/blogs">Blog</Link></li>
                <li><span aria-current="page">{post.category}</span></li>
              </ol>
            </nav>
            <span
              className="blog-chip blog-chip--onhero"
              style={{ marginTop: '16px', display: 'inline-block' }}
            >
              {post.category}
            </span>
            <h1>{post.title}</h1>
            <p className="blog-post-lead">{post.excerpt}</p>
            <div className="blog-post-byline">
              <span className="blog-avatar blog-avatar--lg" aria-hidden="true">{post.author.initials}</span>
              <span className="blog-byline-text">
                <span className="blog-byline-name">{post.author.name}</span>
                <span className="blog-byline-sub">
                  {post.author.title}
                  <span className="blog-meta-dot" aria-hidden="true"> · </span>
                  <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
                  <span className="blog-meta-dot" aria-hidden="true"> · </span>
                  {readingTime(post)} min read
                </span>
              </span>
            </div>
          </div>
        </header>

        <div className="container blog-post-body">
          {post.takeaways.length ? (
            <aside className="blog-takeaways" aria-label="Key takeaways">
              <h2 className="blog-takeaways-title">Key takeaways</h2>
              <ul>
                {post.takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </aside>
          ) : null}

          {toc.length > 2 ? (
            <nav className="blog-toc" aria-label="In this article">
              <p className="blog-toc-title">In this article</p>
              <ol>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <BlogContent blocks={post.blocks} />

          {post.faq.length ? (
            <section className="blog-faq" aria-labelledby="faq-heading">
              <h2 id="faq-heading">Frequently asked questions</h2>
              <div className="blog-faq-list">
                {post.faq.map((item, i) => (
                  <details key={i} className="blog-faq-item">
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          <aside className="blog-author-card">
            <span className="blog-avatar blog-avatar--lg" aria-hidden="true">{post.author.initials}</span>
            <div>
              <p className="blog-author-name">{post.author.name}</p>
              <p className="blog-author-title">{post.author.title}, Techsara</p>
              <p className="blog-author-bio">
                Part of the Techsara team helping US enterprises build, staff and scale production
                AI. <Link href="/book" className="blog-link">Book a consultation</Link> to talk
                through your roadmap.
              </p>
            </div>
          </aside>
        </div>

        <section className="blog-cta">
          <div className="container blog-cta-inner">
            <h2>Put this into practice</h2>
            <p>
              From {post.category.toLowerCase()} strategy to delivery, Techsara helps US enterprises
              move from plan to production. Tell us what you&apos;re building.
            </p>
            <div className="blog-cta-actions">
              <Link href="/book" className="btn btn-primary btn-lg">
                Book a consultation
                <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/solutions" className="btn btn-ghost btn-lg">Explore solutions</Link>
            </div>
          </div>
        </section>

        {related.length ? (
          <section className="blog-related">
            <div className="container">
              <h2 className="blog-section-label">Related reading</h2>
              <div className="blog-grid">
                {related.map((rp) => (
                  <article key={rp.slug} className="blog-card">
                    <Link href={`/blogs/${rp.slug}`} className="blog-card-link" aria-label={rp.title}>
                      <div className={`blog-visual blog-visual--${rp.art}`} aria-hidden="true">
                        <BlogArt art={rp.art} />
                      </div>
                      <div className="blog-card-body">
                        <span className="blog-chip">{rp.category}</span>
                        <h3 className="blog-card-title">{rp.title}</h3>
                        <p className="blog-card-excerpt">{rp.excerpt}</p>
                        <div className="blog-card-meta">
                          <time dateTime={rp.publishedDate}>{formatDate(rp.publishedDate)}</time>
                          <span className="blog-meta-dot" aria-hidden="true">·</span>
                          <span>{readingTime(rp)} min read</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </article>

      <SiteFooter />
    </main>
  );
  } // end if (post)

  // ── S3 blog ──
  const s3Data = await fetchS3BlogBySlug(params.slug);
  if (!s3Data) notFound();

  const { article, content } = s3Data!;
  const gradient = getGradientForArt(article.art || 'staffing');
  const publishDate = article.publishedDate || article.createdAt?.split('T')[0] || '';

  return (
    <main className="blog-page blog-post-page trends-page">
      <SiteHeader />
      <article className="blog-post">

        <header
          className={`blog-post-hero blog-visual--${article.art || 'staffing'}`}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <div className="blog-post-hero-art" aria-hidden="true">
            {article.coverImage ? (
              <img
                src={article.coverImage}
                alt={article.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1,
                }}
              />
            ) : (
              <div style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                background: gradient,
              }} />
            )}
          </div>
          <div className="container blog-post-hero-inner">
            <nav className="blog-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/blogs">Blog</Link></li>
                <li>
                  <span aria-current="page">
                    {article.category || article.kicker || 'Blog'}
                  </span>
                </li>
              </ol>
            </nav>
            {article.kicker && (
              <span
                className="blog-chip blog-chip--onhero"
                style={{ marginTop: '16px', display: 'inline-block' }}
              >
                {article.kicker}
              </span>
            )}
            <h1>{article.title}</h1>
            {article.excerpt && (
              <p className="blog-post-lead">{article.excerpt}</p>
            )}
            {article.author?.name && (
              <div className="blog-post-byline">
                <span className="blog-avatar blog-avatar--lg" aria-hidden="true">
                  {article.author.initials || '?'}
                </span>
                <span className="blog-byline-text">
                  <span className="blog-byline-name">{article.author.name}</span>
                  <span className="blog-byline-sub">
                    {article.author.title && (
                      <>{article.author.title}<span className="blog-meta-dot" aria-hidden="true"> · </span></>
                    )}
                    {publishDate && (
                      <time dateTime={publishDate}>
                        {new Date(publishDate).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </time>
                    )}
                  </span>
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="container blog-post-body">
          <div
            style={{ fontSize: '16px', lineHeight: '1.8', color: '#1e293b' }}
            dangerouslySetInnerHTML={{ __html: stripImages(content) }}
          />
        </div>

        <section className="blog-cta">
          <div className="container blog-cta-inner">
            <h2>Put this into practice</h2>
            <p>
              From {(article.category || 'AI').toLowerCase()} strategy to delivery,
              Techsara helps US enterprises move from plan to production.
              Tell us what you&apos;re building.
            </p>
            <div className="blog-cta-actions">
              <Link href="/book" className="btn btn-primary btn-lg">
                Book a consultation
                <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/solutions" className="btn btn-ghost btn-lg">
                Explore solutions
              </Link>
            </div>
          </div>
        </section>

      </article>
      <SiteFooter />
    </main>
  );
}
