'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  type: string;
  status: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const [artRes, blogRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/blogs'),
      ]);
      const artData = await artRes.json();
      const blogData = await blogRes.json();

      const articles = artData.success ? artData.articles : [];
      const blogs = blogData.success ? blogData.blogs : [];

      const all = [...articles, ...blogs].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setArticles(all);
    } catch {
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const apiBase = articles.find(a => a.id === id)?.type === 'blog'
        ? '/api/blogs'
        : '/api/articles';
      const res = await fetch(`${apiBase}/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert('Failed to delete article');
      }
    } catch {
      alert('Failed to delete article');
    } finally {
      setDeleting(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth');
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
      }}>
        <h1 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#0f172a',
          margin: 0,
        }}>
          Techsara · Content Management
        </h1>
        <button
          onClick={handleLogout}
          style={{
            fontSize: '13px',
            color: '#64748b',
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 14px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Main */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Top row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 4px 0',
            }}>
              Articles & Blogs
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {articles.length} {articles.length === 1 ? 'article' : 'articles'} total
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/sections')}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#1e3a8a',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '8px',
            }}
          >
            Manage Sections
          </button>
          <button
            onClick={() => router.push('/auth/editor')}
            style={{
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + New Article
          </button>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading...</p>
        )}

        {/* Empty */}
        {!loading && articles.length === 0 && !error && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px dashed #e2e8f0',
            borderRadius: '12px',
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 16px 0' }}>
              No articles yet
            </p>
            <button
              onClick={() => router.push('/auth/editor')}
              style={{
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Create your first article
            </button>
          </div>
        )}

        {/* Article list */}
        {!loading && articles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {articles.map((article) => (
              <div
                key={article.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                {/* Left */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: article.type === 'blog' ? '#7c3aed' : '#1e3a8a',
                      backgroundColor: article.type === 'blog' ? '#f5f3ff' : '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {article.type}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      color: article.status === 'published' ? '#16a34a' : '#d97706',
                      backgroundColor: article.status === 'published' ? '#f0fdf4' : '#fffbeb',
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}>
                      {article.status}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: '0 0 4px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {article.title}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    margin: 0,
                  }}>
                    Created {formatDate(article.createdAt)}
                    {article.updatedAt !== article.createdAt &&
                      ` · Updated ${formatDate(article.updatedAt)}`}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => router.push(`/auth/editor?id=${article.id}`)}
                    style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#1e3a8a',
                      backgroundColor: '#eff6ff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={deleting === article.id}
                    style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#ef4444',
                      backgroundColor: '#fef2f2',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      cursor: deleting === article.id ? 'not-allowed' : 'pointer',
                      opacity: deleting === article.id ? 0.6 : 1,
                    }}
                  >
                    {deleting === article.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
