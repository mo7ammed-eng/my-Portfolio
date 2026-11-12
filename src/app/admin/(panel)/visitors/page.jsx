'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import { Badge, Button, Card, EmptyState, Input, Select, Spinner, formatDate, timeAgo } from '@/components/admin/ui';

export default function AdminVisitorsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [device, setDevice] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: '20' });
    if (query) params.set('q', query);
    if (device) params.set('device', device);
    if (activeOnly) params.set('active', '1');
    const res = await adminFetch(`/visitors?${params.toString()}`);
    if (res.ok) {
      setItems(res.data?.data || []);
      setMeta(res.data?.meta || null);
      setError('');
    } else {
      setError(errorMessage(res, 'Could not load visitors.'));
    }
    setLoading(false);
  }, [page, query, device, activeOnly]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), 15000);
    return () => clearInterval(id);
  }, [load]);

  const openVisitor = async (sessionKey) => {
    setSelectedKey(sessionKey);
    setDetail(null);
    setDetailLoading(true);
    const res = await adminFetch(`/visitors/${sessionKey}`);
    if (res.ok) setDetail(res.data);
    else setError(errorMessage(res, 'Could not load visitor detail.'));
    setDetailLoading(false);
  };

  const blockIp = async (ip) => {
    if (!ip || !window.confirm(`Block ${ip}?`)) return;
    const res = await adminFetch('/security/blocked-ips', {
      method: 'POST',
      body: JSON.stringify({
        ip,
        reason: 'Blocked from visitor detail',
        is_permanent: false,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    if (!res.ok) setError(errorMessage(res, 'Could not block IP.'));
  };

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">{error}</div>
      ) : null}

      <Card>
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}
          className="flex flex-wrap items-center gap-2"
        >
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search IP, browser, country…" className="max-w-xs flex-1" />
          <Select value={device} onChange={(e) => { setDevice(e.target.value); setPage(1); }} className="w-auto">
            <option value="">All devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </Select>
          <Button type="button" variant={activeOnly ? 'primary' : 'secondary'} onClick={() => { setActiveOnly(!activeOnly); setPage(1); }}>
            Active only
          </Button>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </Card>

      {loading && !items.length ? (
        <Spinner label="Loading visitor sessions…" />
      ) : items.length === 0 ? (
        <EmptyState title="No visitor sessions" message="Sessions appear as soon as someone requests the site through the BFF." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">
                  <th className="px-5 py-3 font-medium">Visitor</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Device</th>
                  <th className="px-3 py-3 font-medium">Activity</th>
                  <th className="px-5 py-3 text-right font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => openVisitor(s.session_key)}
                    className="cursor-pointer border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${s.is_active ? 'bg-[#059669]' : 'bg-[#CBD5E1]'}`} />
                        <div>
                          <p className="font-mono text-[12px] text-[#0F172A]">{s.ip}</p>
                          <p className="text-[10px] text-[#94A3B8]">{s.user?.email || s.session_key?.slice(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-[#64748B]">
                      {[s.city, s.country].filter(Boolean).join(', ') || 'Unknown'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="slate">{s.device_type || 'unknown'}</Badge>
                        <span className="text-[11px] text-[#64748B]">{s.browser || '—'}</span>
                        {s.is_bot ? <Badge tone="amber">bot</Badge> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-[#64748B]">
                      {s.pages_count ?? 0} pages · {s.requests_count ?? 0} requests
                    </td>
                    <td className="px-5 py-3 text-right text-[11px] text-[#94A3B8]">{timeAgo(s.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-[#F1F5F9] px-4 py-3">
              <p className="text-[11px] text-[#94A3B8]">Page {meta.current_page} of {meta.last_page} · {meta.total} sessions</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}

      {selectedKey ? (
        <div className="fixed inset-0 z-[600] flex justify-end bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setSelectedKey(null)}>
          <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[#0F172A]">Visitor session</h3>
                <p className="font-mono text-[10px] text-[#94A3B8]">{selectedKey}</p>
              </div>
              <div className="flex gap-2">
                {detail?.session?.ip ? (
                  <Button size="sm" variant="danger" onClick={() => blockIp(detail.session.ip)}>Block IP</Button>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => setSelectedKey(null)}>Close</Button>
              </div>
            </div>

            {detailLoading ? (
              <Spinner label="Loading session…" />
            ) : detail ? (
              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['IP', detail.session.ip],
                    ['Location', [detail.session.city, detail.session.country].filter(Boolean).join(', ') || 'Unknown'],
                    ['Browser', `${detail.session.browser || '—'} ${detail.session.browser_version || ''}`.trim()],
                    ['OS', detail.session.os || '—'],
                    ['Device', detail.session.device_type || '—'],
                    ['First seen', formatDate(detail.session.first_seen_at)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-[#F1F5F9] px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">{k}</p>
                      <p className="mt-0.5 truncate text-[12px] text-[#334155]">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Requests', detail.stats?.requests ?? 0],
                    ['Errors', detail.stats?.errors ?? 0],
                    ['Pages', detail.session.pages_count ?? 0],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-[#F1F5F9] px-3 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">{k}</p>
                      <p className="text-[18px] font-semibold text-[#0F172A]">{v}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">Top pages</p>
                  <div className="space-y-1.5">
                    {(detail.pages || []).slice(0, 8).map((p) => (
                      <div key={p.path} className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-2.5 py-1.5">
                        <span className="truncate font-mono text-[11px] text-[#334155]">/{p.path}</span>
                        <span className="text-[11px] text-[#64748B]">{p.views}</span>
                      </div>
                    ))}
                    {!detail.pages?.length ? <p className="text-[11px] text-[#94A3B8]">No pages recorded.</p> : null}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">Recent requests</p>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {(detail.activities?.data || detail.activities || []).map((a) => (
                      <div key={a.id} className="flex items-center gap-2 rounded-lg border border-[#F1F5F9] px-2.5 py-1.5">
                        <Badge tone={a.status >= 500 ? 'red' : a.status >= 400 ? 'amber' : 'green'}>{a.status}</Badge>
                        <span className="truncate font-mono text-[11px] text-[#334155]">{a.method} /{a.path}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-[#94A3B8]">{timeAgo(a.created_at)}</span>
                      </div>
                    ))}
                    {!detail.activities?.length && !detail.activities?.data?.length ? (
                      <p className="text-[11px] text-[#94A3B8]">No requests recorded.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
