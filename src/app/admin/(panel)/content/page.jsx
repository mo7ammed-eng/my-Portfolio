'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CONTENT_TYPES, CONTENT_ORDER, defaultsFor } from '@/components/admin/contentConfig';

const inputClass =
  'w-full bg-[#09090F] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--primary)] focus:outline-none transition-colors';
const labelClass = 'text-[10px] text-white/40 tracking-[0.25em] uppercase mb-1.5 block';

function toForm(type, item) {
  const base = defaultsFor(type);
  if (!item) return base;
  CONTENT_TYPES[type].fields.forEach((field) => {
    const raw = item[field.key];
    if (field.type === 'lines') base[field.key] = Array.isArray(raw) ? raw.join('\n') : '';
    else if (field.type === 'checkbox') base[field.key] = Boolean(raw);
    else if (field.type === 'number') base[field.key] = raw ?? 0;
    else base[field.key] = raw ?? '';
  });
  return base;
}

function payloadFor(type, form) {
  const out = {};
  CONTENT_TYPES[type].fields.forEach((field) => {
    let value = form[field.key];
    if (field.type === 'lines') value = String(value || '').split('\n').map((s) => s.trim()).filter(Boolean);
    else if (field.type === 'number') value = Number(value) || 0;
    else if (field.type === 'checkbox') value = Boolean(value);
    out[field.key] = value;
  });
  return out;
}

export default function ContentAdmin() {
  const router = useRouter();
  const [type, setType] = useState('hero');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultsFor('hero'));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const config = CONTENT_TYPES[type];

  const load = useCallback(async (nextType = type) => {
    setLoading(true);
    setMessage('');
    const res = await fetch(`/api/admin/content/${nextType}`, { cache: 'no-store' });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = res.ok ? await res.json() : [];
    const list = Array.isArray(data) ? data : data ? [data] : [];
    setItems(list);
    setLoading(false);
    if (CONTENT_TYPES[nextType].single) {
      setEditing(list[0] || null);
      setForm(toForm(nextType, list[0] || null));
    } else {
      setEditing(null);
      setForm(defaultsFor(nextType));
    }
  }, [router, type]);

  useEffect(() => {
    load(type);
    if (type === 'skills' && categories.length === 0) {
      fetch('/api/admin/content/skill-categories', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setCategories(Array.isArray(data) ? data : []))
        .catch(() => null);
    }
  }, [type, load, categories.length]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const openNew = () => {
    setEditing({});
    setForm(defaultsFor(type));
    setMessage('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm(toForm(type, item));
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const body = payloadFor(type, form);
    const id = editing?.id;
    const res = await fetch(`/api/admin/content/${type}${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    if (res.ok) {
      setMessage('Saved successfully.');
      await load(type);
    } else {
      const data = await res.json().catch(() => ({}));
      const firstError = data?.errors && Object.values(data.errors).flat()[0];
      setMessage(firstError || data?.error || 'Could not save. Check required fields.');
    }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this item permanently?')) return;
    const res = await fetch(`/api/admin/content/${type}/${item.id}`, { method: 'DELETE' });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    if (res.ok) {
      setMessage('Deleted.');
      await load(type);
    } else {
      setMessage('Could not delete this item.');
    }
  };

  const upload = async (key, file) => {
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) setField(key, data.url);
    else setMessage(data.error || 'Upload failed. Use an image or video.');
  };

  const renderField = (field) => {
    const value = form[field.key];
    if (field.type === 'textarea' || field.type === 'lines') {
      return (
        <div key={field.key} className="md:col-span-2">
          <label className={labelClass}>{field.label}</label>
          <textarea
            className={`${inputClass} min-h-24`}
            value={value ?? ''}
            onChange={(e) => setField(field.key, e.target.value)}
            required={field.required}
          />
        </div>
      );
    }
    if (field.type === 'select') {
      const options = field.optionsFrom ? categories.map((c) => ({ value: c.id, label: c.name })) : field.options.map((o) => ({ value: o, label: o }));
      return (
        <div key={field.key}>
          <label className={labelClass}>{field.label}</label>
          <select className={inputClass} value={value ?? ''} onChange={(e) => setField(field.key, e.target.value)} required={field.required}>
            <option value="">Select...</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    }
    if (field.type === 'checkbox') {
      return (
        <label key={field.key} className="flex items-center gap-2 text-sm text-white/60 pt-6">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => setField(field.key, e.target.checked)} className="accent-[var(--primary)]" />
          {field.label}
        </label>
      );
    }
    if (field.type === 'image') {
      return (
        <div key={field.key}>
          <label className={labelClass}>{field.label}</label>
          <div className="flex gap-2">
            <input className={inputClass} value={value ?? ''} onChange={(e) => setField(field.key, e.target.value)} placeholder="https://..." />
            <label className="shrink-0 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white cursor-pointer">
              Upload
              <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => upload(field.key, e.target.files?.[0])} />
            </label>
          </div>
        </div>
      );
    }
    return (
      <div key={field.key}>
        <label className={labelClass}>{field.label}</label>
        <input
          className={inputClass}
          type={field.type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => setField(field.key, e.target.value)}
          required={field.required}
        />
      </div>
    );
  };

  const tabs = useMemo(() => CONTENT_ORDER, []);
  const showEditor = config.single || Boolean(editing);

  return (
    <div className="max-w-5xl">
      <h1 className="text-white font-black text-2xl tracking-tight mb-1">Content</h1>
      <p className="text-white/30 text-sm mb-6">Edit the text and data shown across the site.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setType(tab)}
            className={`px-3 py-2 rounded-xl text-xs uppercase tracking-widest transition-colors ${
              type === tab ? 'bg-[var(--primary)] text-black font-bold' : 'bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {CONTENT_TYPES[tab].label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${message.includes('success') || message === 'Deleted.' ? 'text-emerald-300 border-emerald-400/20 bg-emerald-400/5' : 'text-red-300 border-red-400/20 bg-red-400/5'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-white/30 text-sm">Loading...</p>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
          {!config.single && (
            <div className="bg-[#15121F] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-sm">{config.label}</h2>
                <button onClick={openNew} className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-black text-xs font-bold">+ New</button>
              </div>
              {items.length === 0 ? (
                <p className="text-white/25 text-sm py-6 text-center">Nothing here yet.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${editing?.id === item.id ? 'border-[var(--primary)]/40 bg-white/5' : 'border-white/5'}`}>
                      <button onClick={() => openEdit(item)} className="flex-1 text-left text-sm text-white/70 hover:text-white truncate">
                        {item[config.titleField] || `#${item.id}`}
                      </button>
                      <button onClick={() => remove(item)} className="text-xs text-white/25 hover:text-red-400">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showEditor && (
            <form onSubmit={save} className="bg-[#15121F] border border-white/5 rounded-2xl p-5">
              <h2 className="text-white font-bold text-sm mb-4">
                {config.single ? `Edit ${config.label}` : editing?.id ? `Edit #${editing.id}` : `New ${config.label} Item`}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {config.fields.map(renderField)}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-black text-sm font-bold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                {!config.single && editing?.id && (
                  <button type="button" onClick={() => remove(editing)} className="px-4 py-2.5 rounded-xl bg-red-400/10 text-red-300 text-sm">
                    Delete
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
