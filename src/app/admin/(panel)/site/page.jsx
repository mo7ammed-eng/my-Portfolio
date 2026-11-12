'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const inputClass =
  'w-full bg-[#09090F] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--primary)] focus:outline-none transition-colors';
const labelClass = 'text-[10px] text-white/40 tracking-[0.25em] uppercase mb-1.5 block';

const PALETTE_FIELDS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'surface_light', label: 'Surface Light' },
  { key: 'text', label: 'Text' },
  { key: 'muted', label: 'Muted' },
];

function rowsToMap(rows) {
  const map = {};
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    map[row.key] = row.value;
  });
  return map;
}

export default function SiteSettingsAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [general, setGeneral] = useState({
    coming_soon: false,
    whatsapp_number: '',
    site_identity: { name: '', email: '', title: '', location: '', copyright_name: '' },
    footer: { email: '', tagline: '' },
    nav: { cta_text: '' },
  });
  const [meta, setMeta] = useState({ title: '', description: '', template: '', site_name: '', og_image: '', keywords: '' });
  const [palette, setPalette] = useState({});

  useEffect(() => {
    const load = async () => {
      const [siteRes, seoRes, themeRes] = await Promise.all([
        fetch('/api/settings?scope=site', { cache: 'no-store' }),
        fetch('/api/settings?scope=seo', { cache: 'no-store' }),
        fetch('/api/settings?scope=theme', { cache: 'no-store' }),
      ]);
      if (siteRes.status === 401 || seoRes.status === 401 || themeRes.status === 401) {
        router.push('/admin/login');
        return;
      }
      const site = rowsToMap(await siteRes.json().catch(() => []));
      const seo = rowsToMap(await seoRes.json().catch(() => []));
      const theme = rowsToMap(await themeRes.json().catch(() => []));

      setGeneral({
        coming_soon: site.coming_soon === true,
        whatsapp_number: typeof site.whatsapp_number === 'string' ? site.whatsapp_number : site.whatsapp_number || '',
        site_identity: { name: '', email: '', title: '', location: '', copyright_name: '', ...(site.site_identity || {}) },
        footer: { email: '', tagline: '', ...(site.footer || {}) },
        nav: { cta_text: '', ...(site.nav || {}) },
      });

      const m = seo.meta || {};
      setMeta({
        title: m.title || '',
        description: m.description || '',
        template: m.template || '',
        site_name: m.site_name || '',
        og_image: m.og_image || '',
        keywords: Array.isArray(m.keywords) ? m.keywords.join(', ') : m.keywords || '',
      });
      setPalette(theme.palette || {});
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [router]);

  const serverMessage = async (res) => {
    if (res.status === 401) {
      router.push('/admin/login');
      return 'Session expired.';
    }
    if (res.ok) return 'Saved.';
    const data = await res.json().catch(() => ({}));
    return data.error || 'Could not save.';
  };

  const saveSetting = async (scope, key, value) => {
    const res = await fetch(`/api/settings?scope=${scope}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    return serverMessage(res);
  };

  const saveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const results = await Promise.all([
      saveSetting('site', 'coming_soon', general.coming_soon),
      saveSetting('site', 'whatsapp_number', general.whatsapp_number),
      saveSetting('site', 'site_identity', general.site_identity),
      saveSetting('site', 'footer', general.footer),
      saveSetting('site', 'nav', general.nav),
    ]);
    setSaving(false);
    setMessage(results.every((r) => r === 'Saved.') ? 'Saved.' : results.find((r) => r !== 'Saved.'));
    router.refresh();
  };

  const saveSeo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const keywords = meta.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    const result = await saveSetting('seo', 'meta', { ...meta, keywords });
    setSaving(false);
    setMessage(result);
    router.refresh();
  };

  const saveTheme = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const result = await saveSetting('theme', 'palette', palette);
    setSaving(false);
    setMessage(result);
    router.refresh();
  };

  const setIdentity = (key, value) => setGeneral((g) => ({ ...g, site_identity: { ...g.site_identity, [key]: value } }));
  const setFooter = (key, value) => setGeneral((g) => ({ ...g, footer: { ...g.footer, [key]: value } }));

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'seo', label: 'SEO' },
    { id: 'theme', label: 'Theme' },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-white font-black text-2xl tracking-tight mb-1">Site Settings</h1>
      <p className="text-white/30 text-sm mb-6">Identity, SEO defaults, theme palette, and availability.</p>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setMessage(''); }}
            className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest transition-colors ${
              tab === t.id ? 'bg-[var(--primary)] text-black font-bold' : 'bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${message === 'Saved.' ? 'text-emerald-300 border-emerald-400/20 bg-emerald-400/5' : 'text-red-300 border-red-400/20 bg-red-400/5'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-white/30 text-sm">Loading...</p>
      ) : (
        <>
          {tab === 'general' && (
            <form onSubmit={saveGeneral} className="bg-[#15121F] border border-white/5 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-white/80">Coming Soon Mode</p>
                  <p className="text-xs text-white/30 mt-0.5">Redirects all public pages to the coming-soon screen.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneral((g) => ({ ...g, coming_soon: !g.coming_soon }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${general.coming_soon ? 'bg-[var(--primary)]' : 'bg-white/10'}`}
                  aria-pressed={general.coming_soon}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${general.coming_soon ? 'left-5.5' : 'left-0.5'}`} style={{ left: general.coming_soon ? '22px' : '2px' }} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Name</label><input className={inputClass} value={general.site_identity.name} onChange={(e) => setIdentity('name', e.target.value)} /></div>
                <div><label className={labelClass}>Professional Title</label><input className={inputClass} value={general.site_identity.title} onChange={(e) => setIdentity('title', e.target.value)} /></div>
                <div><label className={labelClass}>Email</label><input className={inputClass} value={general.site_identity.email} onChange={(e) => setIdentity('email', e.target.value)} /></div>
                <div><label className={labelClass}>Location</label><input className={inputClass} value={general.site_identity.location} onChange={(e) => setIdentity('location', e.target.value)} /></div>
                <div><label className={labelClass}>Copyright Name</label><input className={inputClass} value={general.site_identity.copyright_name} onChange={(e) => setIdentity('copyright_name', e.target.value)} /></div>
                <div><label className={labelClass}>WhatsApp Number</label><input className={inputClass} value={general.whatsapp_number} onChange={(e) => setGeneral((g) => ({ ...g, whatsapp_number: e.target.value }))} placeholder="201038191703" /></div>
                <div><label className={labelClass}>Footer Email</label><input className={inputClass} value={general.footer.email} onChange={(e) => setFooter('email', e.target.value)} /></div>
                <div><label className={labelClass}>Footer Tagline</label><input className={inputClass} value={general.footer.tagline} onChange={(e) => setFooter('tagline', e.target.value)} /></div>
                <div><label className={labelClass}>Navbar CTA Text</label><input className={inputClass} value={general.nav.cta_text} onChange={(e) => setGeneral((g) => ({ ...g, nav: { ...g.nav, cta_text: e.target.value } }))} /></div>
              </div>

              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-black text-sm font-bold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save General'}
              </button>
            </form>
          )}

          {tab === 'seo' && (
            <form onSubmit={saveSeo} className="bg-[#15121F] border border-white/5 rounded-2xl p-5 space-y-4">
              <div><label className={labelClass}>Meta Title</label><input className={inputClass} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></div>
              <div><label className={labelClass}>Title Template</label><input className={inputClass} value={meta.template} onChange={(e) => setMeta({ ...meta, template: e.target.value })} placeholder="%s — Mohammed Waleed | Full Stack Developer" /></div>
              <div><label className={labelClass}>Site Name</label><input className={inputClass} value={meta.site_name} onChange={(e) => setMeta({ ...meta, site_name: e.target.value })} /></div>
              <div><label className={labelClass}>Description</label><textarea className={`${inputClass} min-h-24`} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} /></div>
              <div><label className={labelClass}>Keywords (comma separated)</label><textarea className={`${inputClass} min-h-20`} value={meta.keywords} onChange={(e) => setMeta({ ...meta, keywords: e.target.value })} /></div>
              <div><label className={labelClass}>OG Image</label><input className={inputClass} value={meta.og_image} onChange={(e) => setMeta({ ...meta, og_image: e.target.value })} /></div>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-black text-sm font-bold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save SEO'}
              </button>
            </form>
          )}

          {tab === 'theme' && (
            <form onSubmit={saveTheme} className="bg-[#15121F] border border-white/5 rounded-2xl p-5 space-y-4">
              <p className="text-xs text-white/35">Colors are applied site-wide on the next page load (cached up to 5 minutes).</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {PALETTE_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className={labelClass}>{field.label}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={/^#[0-9a-f]{6}$/i.test(palette[field.key] || '') ? palette[field.key] : '#000000'}
                        onChange={(e) => setPalette({ ...palette, [field.key]: e.target.value })}
                        className="h-10 w-12 rounded-lg border border-white/10 bg-transparent"
                      />
                      <input className={inputClass} value={palette[field.key] || ''} onChange={(e) => setPalette({ ...palette, [field.key]: e.target.value })} />
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-black text-sm font-bold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Theme'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
