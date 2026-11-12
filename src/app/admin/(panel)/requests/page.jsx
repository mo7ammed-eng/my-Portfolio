'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import { Badge, Button, Card, EmptyState, Input, Select, Spinner, formatDate, timeAgo } from '@/components/admin/ui';

const STATUS_TONE = (status) => (status >= 500 ? 'red' : status >= 400 ? 'amber' : 'green');

export default function AdminRequestsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: '25' });
    if (source) params.set('source', source);
    if (status) params.set('status', status);
    if (query) params.set('q', query);
    const res = await adminFetch(`/requests?${params.toString()}`);
    if (res.ok) {
      setItems(res.data?.data || []);
      setMeta(res.data?.meta || null);
      setError('');
    } else {
      setError(errorMessage(res, 'Could not load requests.'));
    }
    setLoading(false);
  }, [page, source, status, query]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), 10000);
    return () => clearInterval(id);
  }, [load]);

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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search path, IP, client…" className="max-w-xs flex-1" />
          <Select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className="w-auto">
            <option value="">All sources</option>
            {['website', 'api', 'github', 'webhook', 'admin', 'console', 'client'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-auto">
            <option value="">Any status</option>
            <option value="errors">Errors (4xx/5xx)</option>
            <option value="200">200</option>
            <option value="201">201</option>
            <option value="401">401</option>
            <option value="403">403</option>
            <option value="404">404</option>
            <option value="422">422</option>
            <option value="500">500</option>
          </Select>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </Card>

      {loading && !items.length ? (
        <Spinner label="Loading request activity…" />
      ) : items.length === 0 ? (
        <EmptyState title="No requests found" message="Change filters or browse the site to generate activity." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">
                  <th className="px-5 py-3 font-medium">Request</th>
                  <th className="px-3 py-3 font-medium">Source</th>
                  <th className="px-3 py-3 font-medium">Origin</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Latency</th>
                  <th className="px-5 py-3 text-right font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="cursor-pointer border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC]"
                  >
                    <td className="px-5 py-3">
                      <span className="mr-2 inline-block w-12 text-[10px] font-semibold text-[#64748B]">{a.method}</span>
                      <span className="font-mono text-[12px] text-[#0F172A]">/{a.path}</span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={a.source === 'website' ? 'blue' : a.source === 'webhook' ? 'violet' : 'slate'}>
                        {a.source || 'unknown'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-[#64748B]">
                      <p className="font-mono">{a.ip || '—'}</p>
                      {a.client || a.client_identifier ? (
                        <p className="truncate text-[10px] text-[#94A3B8]">{a.client || a.client_identifier}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE(a.status || 0)}>{a.status ?? '—'}</Badge>
                    </td>
                    <td className="px-3 py-3 text-[11px] tabular-nums text-[#64748B]">
                      {a.duration_ms != null ? `${a.duration_ms} ms` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-[11px] text-[#94A3B8]">{timeAgo(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-[#F1F5F9] px-4 py-3">
              <p className="text-[11px] text-[#94A3B8]">Page {meta.current_page} of {meta.last_page} · {meta.total} requests</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}

      {selected ? (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-[#0F172A]/40 px-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE(selected.status || 0)}>{selected.status ?? '—'}</Badge>
                  <Badge tone="slate">{selected.source || 'unknown'}</Badge>
                </div>
                <h3 className="mt-2 font-mono text-[13px] font-semibold text-[#0F172A]">
                  {selected.method} /{selected.path}
                </h3>
                <p className="text-[11px] text-[#94A3B8]">{formatDate(selected.created_at)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
              {[
                ['Endpoint', selected.endpoint || '—'],
                ['IP', selected.ip || '—'],
                ['Client', selected.client || selected.client_identifier || '—'],
                ['Session', selected.session_key || '—'],
                ['Duration', selected.duration_ms != null ? `${selected.duration_ms} ms` : '—'],
                ['Error', selected.is_error ? 'yes' : 'no'],
                ['Referer', selected.referer || '—'],
                ['User', selected.user_id || 'guest'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-[#F1F5F9] px-2.5 py-2">
                  <dt className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">{k}</dt>
                  <dd className="mt-0.5 truncate font-mono text-[11px] text-[#334155]" title={String(v)}>{String(v)}</dd>
                </div>
              ))}
            </dl>
            {selected.user_agent ? (
              <div className="mt-3 rounded-lg bg-[#F8FAFC] p-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">User agent</p>
                <p className="mt-1 break-words font-mono text-[10px] text-[#475569]">{selected.user_agent}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
