'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

function stripImages(html: string): string {
  if (!html) return '';
  // Only strip Salesforce internal images (file.force.com)
  // S3 images and other public images are kept and displayed
  return html.replace(
    /<img[^>]*src="[^"]*file\.force\.com[^"]*"[^>]*\/?>/gi,
    ''
  );
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => {
        if (!data.success) { setNotFound(true); return; }
        const found = data.articles.find((a: any) => a.slug === slug);
        if (!found) { setNotFound(true); return; }
        setArticle(found);
        return fetch(`/api/articles/${found.id}`)
          .then(r => r.json())
          .then(detail => {
            if (detail.success) setContent(detail.content || '');
          });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{
      minHeight: '60vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ color: '#64748b' }}>Loading...</p>
    </div>
  );

  if (notFound) return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
    }}>
      <p style={{ color: '#64748b', fontSize: '16px' }}>Article not found.</p>
      <button onClick={() => router.push('/articles')}
        style={{
          backgroundColor: '#1e3a8a', color: '#fff',
          border: 'none', borderRadius: '8px',
          padding: '10px 20px', fontSize: '14px', cursor: 'pointer',
        }}>
        Back to Articles
      </button>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>

        {/* Hero section */}
        <header style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '360px',
          display: 'flex',
          alignItems: 'flex-end',
          backgroundColor: '#0f172a',
        }}>
          {/* Art or cover image background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            opacity: article?.coverImage ? 1 : 0.6,
          }}>
            {article?.coverImage ? (
              <img
                src={article.coverImage}
                alt={article?.title || ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a5f 0%, #1e3a8a 50%, #2563eb 100%)' }} />
            )}
          </div>

          {/* Dark gradient overlay for text readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
            zIndex: 1,
          }} />

          {/* Hero content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '780px',
            margin: '0 auto',
            padding: '80px 24px 48px',
            width: '100%',
          }}>
            <Link
              href="/articles"
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '20px',
              }}
            >
              ← Back to Articles
            </Link>

            {article?.categoryLabel && (
              <p style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                {article.categoryLabel}
              </p>
            )}

            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: '1.2',
              marginBottom: '16px',
            }}>
              {article?.title}
            </h1>

            {article?.excerpt && (
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: '1.6',
                maxWidth: '600px',
              }}>
                {article.excerpt}
              </p>
            )}
          </div>
        </header>

        {/* Article body */}
        <div style={{
          maxWidth: '780px',
          margin: '0 auto',
          padding: '48px 24px',
        }}>
          {article?.createdAt && (
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '32px' }}>
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          )}

          {content && (
            <div
              style={{ fontSize: '16px', lineHeight: '1.8', color: '#1e293b' }}
              dangerouslySetInnerHTML={{ __html: stripImages(content) }}
            />
          )}

          <div style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #f1f5f9',
          }}>
            <Link
              href="/articles"
              style={{
                display: 'inline-block',
                backgroundColor: '#f1f5f9',
                color: '#1e3a8a',
                textDecoration: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              ← Back to Articles
            </Link>
          </div>
        </div>

      </main>

      <style>{`
        div h2 { font-size:22px; font-weight:700; margin:28px 0 10px; color:#0f172a; }
        div h3 { font-size:18px; font-weight:600; margin:22px 0 8px; color:#0f172a; }
        div p { margin:0 0 16px 0; }
        div ul, div ol { padding-left:24px; margin:8px 0 16px; }
        div li { margin-bottom:6px; }
        div blockquote { border-left:3px solid #e2e8f0; padding-left:16px; color:#64748b; margin:16px 0; }
        div pre { background:#1e293b; color:#e2e8f0; padding:16px; border-radius:8px; font-size:13px; overflow-x:auto; margin:16px 0; }
        div img { max-width:100%; border-radius:8px; margin:12px 0; }
        div hr { border:none; border-top:2px solid #f1f5f9; margin:24px 0; }
        a { color: #1e3a8a; }
        strong { font-weight: 700; }
      `}</style>

      <SiteFooter />
    </>
  );
}
