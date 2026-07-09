'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextAlign from '@tiptap/extension-text-align';
import { common, createLowlight } from 'lowlight';
const lowlight = createLowlight(common);

const DRAFT_KEY = 'article_editor_draft';

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id') ?? null;

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [type, setType] = useState('article');
  const [status, setStatus] = useState('published');
  const [coverImage, setCoverImage] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [draftRestored, setDraftRestored] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [kicker, setKicker] = useState('');
  const [category, setCategory] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [authorInitials, setAuthorInitials] = useState('');
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sections, setSections] = useState<any[]>([]);
  const [validationError, setValidationError] = useState('');
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Start writing your article here...',
      }),
      Youtube.configure({ controls: true }),
      CodeBlockLowlight.configure({ lowlight }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: () => {
      autoSaveDraft();
    },
  });

  // Auto-save draft to localStorage
  const autoSaveDraft = useCallback(() => {
    if (!editor) return;
    const draft = {
      title,
      excerpt,
      type,
      status,
      coverImage,
      sectionId,
      categoryLabel,
      kicker,
      category,
      authorName,
      authorTitle,
      authorInitials,
      publishedDate,
      content: editor.getHTML(),
      editId: editId || null,
      lastSaved: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [editor, title, excerpt, type, status, coverImage, sectionId, categoryLabel, kicker, category, authorName, authorTitle, authorInitials, publishedDate, editId]);

  // Auto-save on title/excerpt/type/status change
  useEffect(() => {
    autoSaveDraft();
  }, [title, excerpt, type, status, coverImage]);

  // On load: if editing, fetch article. Else check for draft.
  useEffect(() => {
    if (editId) {
      fetchArticle(editId);
    } else {
      checkForDraft();
    }
  }, [editId]);

  useEffect(() => {
    fetch('/api/sections')
      .then(r => r.json())
      .then(data => {
        if (data.success) setSections(data.sections);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editor && fetchedContent !== null) {
      editor.commands.setContent(fetchedContent);
      setFetchedContent(null);
    }
  }, [editor, fetchedContent]);

  function checkForDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      const age = Date.now() - draft.lastSaved;
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (age < oneDayMs && !draft.editId) {
        const restore = confirm(
          'You have an unsaved draft from ' +
          new Date(draft.lastSaved).toLocaleTimeString() +
          '. Restore it?'
        );
        if (restore) {
          setTitle(draft.title || '');
          setExcerpt(draft.excerpt || '');
          setType(draft.type || 'article');
          setStatus(draft.status || 'published');
          setCoverImage(draft.coverImage || '');
          setSectionId(draft.sectionId || '');
          setCategoryLabel(draft.categoryLabel || '');
          setKicker(draft.kicker || '');
          setCategory(draft.category || '');
          setAuthorName(draft.authorName || '');
          setAuthorTitle(draft.authorTitle || '');
          setAuthorInitials(draft.authorInitials || '');
          setPublishedDate(draft.publishedDate || new Date().toISOString().split('T')[0]);
          setFetchedContent(draft.content || '');
          setDraftRestored(true);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }

  async function fetchArticle(id: string) {
    try {
      // Try articles first
      let res = await fetch(`/api/articles/${id}`);
      let data = await res.json();

      // If not found, try blogs
      if (!data.success) {
        res = await fetch(`/api/blogs/${id}`);
        data = await res.json();
      }

      if (data.success) {
        const item = data.article || data.blog;
        setTitle(item.title);
        setExcerpt(item.excerpt || '');
        setType(item.type || 'article');
        setStatus(item.status || 'published');
        setCoverImage(item.coverImage || '');
        setSectionId(item.sectionId || '');
        setCategoryLabel(item.categoryLabel || '');
        setKicker(item.kicker || '');
        setCategory(item.category || '');
        setAuthorName(item.author?.name || '');
        setAuthorTitle(item.author?.title || '');
        setAuthorInitials(item.author?.initials || '');
        setPublishedDate(
          item.publishedDate || new Date().toISOString().split('T')[0]
        );
        setFetchedContent(data.content || '');
      }
    } catch {
      alert('Failed to load item for editing');
    } finally {
      setLoadingEdit(false);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'covers');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
      } else {
        alert('Image upload failed: ' + data.message);
      }
    } catch {
      alert('Image upload failed');
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleInlineImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'inline');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert('Image upload failed: ' + data.message);
      }
    } catch {
      alert('Image upload failed');
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage('');
    const errors = [];
    if (!title.trim()) errors.push('Title is required');
    if (!editor || editor.isEmpty) errors.push('Content is required');
    if (type === 'blog') {
      if (!category.trim()) errors.push('Category is required');
      if (!kicker.trim()) errors.push('Kicker is required');
      if (!authorName.trim()) errors.push('Author name is required');
    } else {
      if (!sectionId) errors.push('Please select a section');
      if (!categoryLabel.trim()) errors.push('Category label is required');
    }
    if (errors.length > 0) {
      setValidationError(errors[0]);
      setSaving(false);
      return;
    }
    setValidationError('');
    try {
      const body = {
        title: title.trim(),
        content: editor.getHTML(),
        excerpt: excerpt.trim(),
        coverImage,
        type,
        status,
        ...(type === 'blog' && {
          kicker,
          category,
          publishedDate,
          author: {
            name: authorName.trim(),
            title: authorTitle.trim(),
            initials: authorInitials.trim().toUpperCase(),
          },
        }),
        ...(type === 'article' && { sectionId, categoryLabel }),
      };
      const apiBase = type === 'blog' ? '/api/blogs' : '/api/articles';
      const url = editId ? `${apiBase}/${editId}` : apiBase;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem(DRAFT_KEY);
        setSaveMessage('Saved successfully!');
        setTimeout(() => router.push('/auth/dashboard'), 1200);
      } else {
        setSaveMessage('Failed to save: ' + data.message);
      }
    } catch {
      setSaveMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingEdit) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: '#64748b' }}>Loading article...</p>
      </div>
    );
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
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/auth/dashboard')}
            style={{
              fontSize: '13px', color: '#64748b',
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
            }}
          >
            ← Dashboard
          </button>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
            {editId ? 'Edit Article' : 'New Article'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saveMessage && (
            <span style={{
              fontSize: '13px',
              color: saveMessage.includes('Failed') ? '#ef4444' : '#16a34a',
            }}>
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#93c5fd' : '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : editId ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Draft restored banner */}
        {draftRestored && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#92400e',
          }}>
            Draft restored. Your previous unsaved work has been recovered.
          </div>
        )}

        {/* Type + Status row */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '20px',
        }}>
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '500',
              color: '#64748b', display: 'block', marginBottom: '4px',
            }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                padding: '8px 12px', border: '1px solid #e2e8f0',
                borderRadius: '7px', fontSize: '13px',
                backgroundColor: '#fff', cursor: 'pointer',
              }}
            >
              <option value="article">Article</option>
              <option value="blog">Blog</option>
            </select>
          </div>
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '500',
              color: '#64748b', display: 'block', marginBottom: '4px',
            }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: '8px 12px', border: '1px solid #e2e8f0',
                borderRadius: '7px', fontSize: '13px',
                backgroundColor: '#fff', cursor: 'pointer',
              }}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Validation error */}
        {validationError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#dc2626',
          }}>
            {validationError}
          </div>
        )}

        {/* ARTICLE FIELDS — only when type is article */}
        {type === 'article' && (
          <>
            {/* Section dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: '500',
                color: '#64748b', display: 'block', marginBottom: '4px',
              }}>
                Section / Topic *
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '7px', fontSize: '13px',
                  backgroundColor: '#fff', boxSizing: 'border-box' as const,
                }}
              >
                <option value="">-- Select a section --</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Category Label */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: '500',
                color: '#64748b', display: 'block', marginBottom: '4px',
              }}>
                Category Label * (e.g. THOUGHT LEADERSHIP)
              </label>
              <input
                type="text"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value.toUpperCase())}
                placeholder="THOUGHT LEADERSHIP"
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '7px', fontSize: '13px',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>
          </>
        )}

        {/* BLOG FIELDS — only when type is blog */}
        {type === 'blog' && (
          <>
            {/* Category */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: '500',
                color: '#64748b', display: 'block', marginBottom: '4px',
              }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '7px',
                  fontSize: '13px', backgroundColor: '#fff',
                  boxSizing: 'border-box' as const,
                }}
              >
                <option value="">-- Select a category --</option>
                <option value="AI Staffing">AI Staffing</option>
                <option value="Generative AI">Generative AI</option>
                <option value="Cloud & MLOps">Cloud &amp; MLOps</option>
                <option value="Industry Insights">Industry Insights</option>
              </select>
            </div>

            {/* Kicker */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: '500',
                color: '#64748b', display: 'block', marginBottom: '4px',
              }}>
                Kicker * (short label above title, e.g. INDUSTRY INSIGHTS)
              </label>
              <input
                type="text"
                value={kicker}
                onChange={(e) => setKicker(e.target.value.toUpperCase())}
                placeholder="INDUSTRY INSIGHTS"
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '7px',
                  fontSize: '13px', boxSizing: 'border-box' as const,
                }}
              />
            </div>

            {/* Published Date */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: '500',
                color: '#64748b', display: 'block', marginBottom: '4px',
              }}>
                Published Date
              </label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '7px',
                  fontSize: '13px', boxSizing: 'border-box' as const,
                }}
              />
            </div>

            {/* Author */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: '500',
                color: '#64748b', display: 'block', marginBottom: '4px',
              }}>
                Author *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 80px',
                gap: '8px',
              }}>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Full name"
                  style={{
                    padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: '7px', fontSize: '13px',
                    boxSizing: 'border-box' as const,
                  }}
                />
                <input
                  type="text"
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  placeholder="Job title"
                  style={{
                    padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: '7px', fontSize: '13px',
                    boxSizing: 'border-box' as const,
                  }}
                />
                <input
                  type="text"
                  value={authorInitials}
                  onChange={(e) =>
                    setAuthorInitials(e.target.value.toUpperCase().slice(0, 2))
                  }
                  placeholder="AB"
                  maxLength={2}
                  style={{
                    padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: '7px', fontSize: '13px',
                    boxSizing: 'border-box' as const,
                    textAlign: 'center',
                  }}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Name · Job Title · Initials (2 letters)
              </p>
            </div>
          </>
        )}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title..."
          style={{
            width: '100%',
            fontSize: '26px',
            fontWeight: '700',
            color: '#0f172a',
            border: 'none',
            borderBottom: '2px solid #f1f5f9',
            padding: '0 0 12px 0',
            marginBottom: '16px',
            outline: 'none',
            backgroundColor: 'transparent',
            boxSizing: 'border-box',
          }}
        />

        {/* Excerpt */}
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt (shown on article listing)..."
          rows={2}
          style={{
            width: '100%',
            fontSize: '14px',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '20px',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />

        {/* Cover image */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontSize: '12px', fontWeight: '500',
            color: '#64748b', display: 'block', marginBottom: '8px',
          }}>
            Cover Image
          </label>
          {coverImage && (
            <img
              src={coverImage}
              alt="Cover"
              style={{
                width: '100%', height: '200px',
                objectFit: 'cover', borderRadius: '8px',
                marginBottom: '8px',
              }}
            />
          )}
          <label style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '7px',
            fontSize: '13px',
            color: '#374151',
            cursor: 'pointer',
            fontWeight: '500',
          }}>
            {coverUploading
              ? 'Uploading...'
              : coverImage ? 'Change Cover' : 'Upload Cover Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
              disabled={coverUploading}
            />
          </label>
        </div>

        {/* Editor toolbar */}
        {editor && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
          }}>
            {[
              { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
              { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
              { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
              { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
              { label: '• List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
              { label: '1. List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
              { label: 'Quote', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
              { label: '</> Code', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
              { label: '— Divider', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
              { label: 'Left', action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
              { label: 'Center', action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: btn.active ? '700' : '500',
                  color: btn.active ? '#1e3a8a' : '#374151',
                  backgroundColor: btn.active ? '#eff6ff' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {btn.label}
              </button>
            ))}

            {/* Inline image upload button */}
            <label style={{
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '5px',
              cursor: 'pointer',
            }}>
              + Image
              <input
                type="file"
                accept="image/*"
                onChange={handleInlineImageUpload}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={() => {
                const url = prompt('Paste YouTube URL:');
                if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
              }}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              + YouTube
            </button>

            {/* SVG Insert */}
            <button
              onClick={() => {
                const svg = prompt('Paste SVG code:');
                if (svg?.trim().startsWith('<svg') && editor) {
                  editor.chain().focus().insertContent(svg).run();
                } else if (svg) {
                  alert('Must start with <svg');
                }
              }}
              style={{
                padding: '5px 10px', fontSize: '12px', fontWeight: '500',
                color: '#374151', backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0', borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              + SVG
            </button>

            {/* Image alignment */}
            {[
              { label: 'Img◀', style: 'float:left;margin:0 16px 8px 0;max-width:50%;' },
              { label: 'Img●', style: 'display:block;margin:0 auto;' },
              { label: 'Img▶', style: 'float:right;margin:0 0 8px 16px;max-width:50%;' },
              { label: 'Img↔', style: 'width:100%;display:block;' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => editor?.chain().focus()
                  .updateAttributes('image', { style: btn.style }).run()}
                style={{
                  padding: '5px 10px', fontSize: '12px', fontWeight: '500',
                  color: '#374151', backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0', borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Editor content area */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0 0 8px 8px',
          padding: '20px',
          minHeight: '400px',
          fontSize: '15px',
          lineHeight: '1.7',
          color: '#1e293b',
        }}>
          <EditorContent editor={editor} />
        </div>

        {/* Bottom save */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          marginTop: '24px', gap: '12px',
        }}>
          <button
            onClick={() => router.push('/auth/dashboard')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#93c5fd' : '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : editId ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      {/* Tiptap base styles */}
      <style>{`
        .ProseMirror { outline: none; min-height: 360px; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror img { max-width: 100%; border-radius: 6px; margin: 8px 0; }
        .ProseMirror h2 { font-size: 22px; font-weight: 700; margin: 20px 0 8px; }
        .ProseMirror h3 { font-size: 18px; font-weight: 600; margin: 16px 0 6px; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
        .ProseMirror blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 16px;
          color: #64748b;
          margin: 12px 0;
        }
        .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
          overflow-x: auto;
          margin: 12px 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
}
