'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Section {
  id: string; name: string; anchorId: string;
  heading: string; description: string;
  categoryTags: string[]; icon: string;
  gradient: string; order: number;
}

const emptyForm = {
  name: '', heading: '', description: '',
  categoryTags: '', icon: '', anchorId: '', gradient: '',
};

export default function SectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingOrder, setPendingOrder] = useState<Section[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const displayedSections = pendingOrder ?? sections;
  const hasUnsavedOrder = pendingOrder !== null;

  useEffect(() => { fetchSections(); }, []);

  async function fetchSections() {
    try {
      const res = await fetch(
        `/api/sections?t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (data.success) setSections(data.sections);
    } finally { setLoading(false); }
  }

  async function handleSave(isEdit: boolean) {
    if (!form.name.trim()) {
      setMessage('Section name is required'); return;
    }
    setSaving(true); setMessage('');
    try {
      const body = {
        name: form.name.trim(),
        heading: form.heading.trim() || `${form.name.trim()} articles`,
        description: form.description.trim(),
        categoryTags: form.categoryTags
          .split(',').map(t => t.trim().toUpperCase()).filter(Boolean),
        icon: form.icon.trim(),
        anchorId: form.anchorId.trim(),
        gradient: form.gradient.trim() ||
          'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      };
      const url = isEdit
        ? `/api/sections/${editingId}` : '/api/sections';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(isEdit ? 'Section updated!' : 'Section created!');
        setForm(emptyForm);
        setEditingId(null);
        setShowAddForm(false);
        fetchSections();
      } else {
        setMessage(data.message || 'Failed to save');
      }
    } catch {
      setMessage('Failed to save section');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(
      `Delete section "${name}"?\nArticles in this section will not be deleted.`
    )) return;
    try {
      const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSections(prev => prev.filter(s => s.id !== id));
      } else { alert('Failed to delete section'); }
    } catch { alert('Failed to delete section'); }
  }

  function handleReorder(index: number, direction: 'up' | 'down') {
    const current = (pendingOrder ?? sections).slice().sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= current.length) return;

    const reordered = [...current];
    const temp = reordered[index];
    reordered[index] = reordered[swapIndex];
    reordered[swapIndex] = temp;

    setPendingOrder(reordered.map((s, i) => ({ ...s, order: i + 1 })));
  }

  async function handleSaveOrder() {
    if (!pendingOrder) return;
    setSavingOrder(true);
    try {
      await Promise.all(
        pendingOrder.map(s =>
          fetch(`/api/sections/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: s.order }),
          })
        )
      );
      setPendingOrder(null);
      await fetchSections();
    } catch {
      alert('Failed to save order. Please try again.');
    } finally {
      setSavingOrder(false);
    }
  }

  function handleResetOrder() {
    setPendingOrder(null);
  }

  function startEdit(section: Section) {
    setEditingId(section.id);
    setShowAddForm(false);
    setForm({
      name: section.name,
      heading: section.heading,
      description: section.description,
      categoryTags: section.categoryTags.join(', '),
      icon: section.icon || '',
      anchorId: section.anchorId || '',
      gradient: section.gradient || '',
    });
    setMessage('');
  }

  function cancelForm() {
    setEditingId(null);
    setShowAddForm(false);
    setForm(emptyForm);
    setMessage('');
  }

  const labelStyle = {
    fontSize: '12px', fontWeight: '500' as const,
    color: '#64748b', display: 'block', marginBottom: '4px',
  };
  const inputStyle = {
    width: '100%', padding: '8px 12px',
    border: '1px solid #e2e8f0', borderRadius: '7px',
    fontSize: '13px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  const formUI = (isEdit: boolean) => (
    <div style={{
      backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: '10px', padding: '20px', marginBottom: '16px',
    }}>
      <h3 style={{
        fontSize: '15px', fontWeight: '600',
        color: '#0f172a', margin: '0 0 16px 0',
      }}>
        {isEdit ? 'Edit Section' : 'New Section'}
      </h3>

      {message && (
        <p style={{
          color: message.includes('!') ? '#16a34a' : '#dc2626',
          fontSize: '13px', marginBottom: '12px',
        }}>
          {message}
        </p>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
      }}>
        <div>
          <label style={labelStyle}>Section Name *</label>
          <input style={inputStyle} value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Data & AI" />
        </div>
        <div>
          <label style={labelStyle}>Anchor ID</label>
          <input style={inputStyle} value={form.anchorId}
            onChange={e => setForm(p => ({ ...p, anchorId: e.target.value }))}
            placeholder="e.g. topic-data-ai" />
        </div>
        <div>
          <label style={labelStyle}>Section Heading</label>
          <input style={inputStyle} value={form.heading}
            onChange={e => setForm(p => ({ ...p, heading: e.target.value }))}
            placeholder="e.g. Data and AI articles" />
        </div>
        <div>
          <label style={labelStyle}>Category Tags (comma separated)</label>
          <input style={inputStyle} value={form.categoryTags}
            onChange={e => setForm(p => ({ ...p, categoryTags: e.target.value }))}
            placeholder="GOVERNANCE, MIGRATION, MLOPS" />
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={labelStyle}>Section Description</label>
        <textarea rows={2}
          style={{ ...inputStyle, resize: 'vertical' as const }}
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Short description shown under the section heading" />
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={labelStyle}>
          Gradient (for article cards with no cover image)
        </label>
        <input style={inputStyle} value={form.gradient}
          onChange={e => setForm(p => ({ ...p, gradient: e.target.value }))}
          placeholder="linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" />
        {form.gradient && (
          <div style={{
            height: '24px', borderRadius: '4px', marginTop: '6px',
            background: form.gradient,
          }} />
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={labelStyle}>Section Icon SVG (optional)</label>
        <textarea rows={3}
          style={{
            ...inputStyle,
            fontFamily: 'monospace', resize: 'vertical' as const,
          }}
          value={form.icon}
          onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
          placeholder="<svg ...>...</svg>" />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button onClick={() => handleSave(isEdit)} disabled={saving}
          style={{
            backgroundColor: saving ? '#93c5fd' : '#1e3a8a',
            color: '#fff', border: 'none', borderRadius: '7px',
            padding: '9px 20px', fontSize: '13px', fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>
          {saving ? 'Saving...' : isEdit ? 'Update Section' : 'Create Section'}
        </button>
        <button onClick={cancelForm}
          style={{
            backgroundColor: '#f1f5f9', color: '#64748b',
            border: 'none', borderRadius: '7px',
            padding: '9px 20px', fontSize: '13px', cursor: 'pointer',
          }}>
          Cancel
        </button>
      </div>
    </div>
  );

  const sortedSections = [...displayedSections].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{
        backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px',
      }}>
        <h1 style={{
          fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0,
        }}>
          Techsara · Content Management
        </h1>
        <button onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/auth');
        }} style={{
          fontSize: '13px', color: '#64748b', background: 'none',
          border: '1px solid #e2e8f0', borderRadius: '6px',
          padding: '6px 14px', cursor: 'pointer',
        }}>
          Sign Out
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '24px',
        }}>
          <div>
            <button onClick={() => router.push('/auth/dashboard')}
              style={{
                fontSize: '13px', color: '#64748b', background: 'none',
                border: 'none', cursor: 'pointer', padding: 0,
                marginBottom: '8px', display: 'block',
              }}>
              ← Dashboard
            </button>
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0,
            }}>
              Manage Sections
            </h2>
          </div>
          {!showAddForm && !editingId && (
            <button
              onClick={() => { setShowAddForm(true); setMessage(''); }}
              style={{
                backgroundColor: '#1e3a8a', color: '#fff',
                border: 'none', borderRadius: '8px',
                padding: '10px 20px', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer',
              }}>
              + Add Section
            </button>
          )}
        </div>

        {hasUnsavedOrder && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
          }}>
            <span style={{
              fontSize: '13px',
              color: '#92400e',
              fontWeight: '500',
            }}>
              You have unsaved order changes
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleResetOrder}
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Reset
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={savingOrder}
                style={{
                  fontSize: '13px',
                  color: '#ffffff',
                  backgroundColor: savingOrder ? '#93c5fd' : '#1e3a8a',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  cursor: savingOrder ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                }}
              >
                {savingOrder ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </div>
        )}

        {showAddForm && formUI(false)}

        {loading && (
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading...</p>
        )}

        {!loading && sections.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            No sections yet.
          </p>
        )}

        {sortedSections.map((section, index) => (
            <div key={section.id}>
              {editingId === section.id && formUI(true)}
              {editingId !== section.id && (
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: section.gradient ||
                          'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                      }} />
                      <span style={{
                        fontSize: '15px', fontWeight: '600', color: '#0f172a',
                      }}>
                        {section.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        #{section.anchorId}
                      </span>
                    </div>
                    {section.categoryTags?.length > 0 && (
                      <p style={{
                        fontSize: '11px', color: '#94a3b8',
                        margin: '4px 0 0 38px',
                      }}>
                        {section.categoryTags.join(', ')}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: '2px',
                    }}>
                      <button
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                        style={{
                          width: '26px', height: '22px', fontSize: '11px',
                          color: index === 0 ? '#cbd5e1' : '#64748b',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', lineHeight: 1,
                        }}
                      >↑</button>
                      <button
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === sortedSections.length - 1}
                        title="Move down"
                        style={{
                          width: '26px', height: '22px', fontSize: '11px',
                          color: index === sortedSections.length - 1
                            ? '#cbd5e1' : '#64748b',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          cursor: index === sortedSections.length - 1
                            ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', lineHeight: 1,
                        }}
                      >↓</button>
                    </div>
                    <button onClick={() => startEdit(section)}
                      style={{
                        fontSize: '13px', color: '#1e3a8a',
                        backgroundColor: '#eff6ff', border: 'none',
                        borderRadius: '6px', padding: '7px 14px',
                        cursor: 'pointer', fontWeight: '500',
                      }}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(section.id, section.name)}
                      style={{
                        fontSize: '13px', color: '#ef4444',
                        backgroundColor: '#fef2f2', border: 'none',
                        borderRadius: '6px', padding: '7px 14px',
                        cursor: 'pointer', fontWeight: '500',
                      }}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
