'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import { Badge, Button, Card, EmptyState, Field, Input, SectionHeader, Select, Spinner, formatDate, timeAgo } from '@/components/admin/ui';

const LEVEL_TONE = { debug: 'slate', info: 'blue', warning: 'amber', error: 'red', critical: 'red' };
const LEVELS = ['debug', 'info', 'warning', 'error', 'critical'];

export default function AdminSystemConsolePage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [auto, setAuto] = useState(true);
  const [clearing, setClearing] = useState(false);

  const params = useCallback(() => {
    const p = new URLSearchParams({ page: String(page), per_page: '25' });
    if (level) p.set('level', level);
    if (category) p.set('category', category);
    if (query) p.set('q', query);
    return p;
  }, [page, level, category, query]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [logsRes, statsRes] = await Promise.all([
      adminFetch(`/system-logs?${params().toString()}`),
      adminFetch('/system-logs/stats?days=7'),
    ]);
    if (logsRes.ok) {
      setLogs(logsRes.data?.data || []);
      setMeta(logsRes.data?.meta || null);
    } else {
      setError(errorMessage(logsRes, 'Could not load logs.'));
    }
    if (statsRes.ok) setStats(statsRes.data);
    setLoading(false);
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
  }, [auto, load]);

  const openDetail = async (log) => {
    setSelected(log);
    setDetail(null);
    const res = await adminFetch(`/system-logs/${log.uuid}`);
    if (res.ok) setDetail(res.data?.log || null);
  };

  const clearOld = async (days) => {
    if (!window.confirm(`Delete logs older than ${days} days? This cannot be undone.`)) return;
    setClearing(true);
    const res = await adminFetch('/system-logs/clear', { method: 'POST', body: JSON.stringify({ days }) });
    if (res.ok) {
      setError('');
      await load();
    } else {
      setError(errorMessage(res, 'Could not clear logs.'));
    }
    setClearing(false);
  };

  const byLevel = stats?.by_level || {};
  const categories = stats?.by_category || [];
  const exportUrl = `/api/admin/system-logs/export?${params().toString()}`;

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">{error}</div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => { setLevel(level === l ? '' : l); setPage(1); }}
            className={`rounded-2xl border bg-white p-4 text-left transition-colors ${
              level === l ? 'border-[#2563EB] ring-2 ring-[#DBEAFE]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge tone={LEVEL_TONE[l]}>{l}</Badge>
              <span className="text-[18px] font-semibold tabular-nums text-[#0F172A]">{byLevel[l] || 0}</span>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">last 7 days</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}
            className="flex flex-1 flex-wrap gap-2"
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search message, source, exception…"
              className="max-w-xs flex-1"
            />
            <Select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="w-auto">
              <option value="">All levels</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-auto">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.category} value={c.category}>{c.category} ({c.count})</option>)}
            </Select>
            <Button type="submit" variant="secondary">Filter</Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={auto ? 'primary' : 'secondary'}
              onClick={() => setAuto(!auto)}
              title="Toggle 5s auto refresh"
            >
              {auto ? 'Live · 5s' : 'Paused'}
            </Button>
            <a href={exportUrl} download>
              <Button size="sm" variant="secondary">Export CSV</Button>
            </a>
            <Button size="sm" variant="secondary" onClick={() => clearOld(30)} disabled={clearing}>
              {clearing ? 'Clearing…' : 'Clear > 30d'}
            </Button>
          </div>
        </div>
      </Card>

      {loading && !logs.length ? (
        <Spinner label="Loading system logs…" />
      ) : logs.length === 0 ? (
        <EmptyState title="No logs match your filters" message="Try widening the level, category or search." />
      ) : (
        <Card padded={false}>
          <div className="max-h-[560px] divide-y divide-[#F1F5F9] overflow-y-auto">
            {logs.map((log) => (
              <button
                key={log.uuid}
                onClick={() => openDetail(log)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8FAFC]"
              >
                <Badge tone={LEVEL_TONE[log.level] || 'slate'}>{log.level}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">{log.category}</span>
                    {log.http_status ? (
                      <span className={`text-[10px] font-semibold ${log.http_status >= 500 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                        HTTP {log.http_status}
                      </span>
                    ) : null}
                    <span className="ml-auto text-[10px] text-[#94A3B8]">{timeAgo(log.created_at)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-[#0F172A]">{log.message}</p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-[#94A3B8]">
                    {log.source || 'app'}
                    {log.request_url ? ` · ${log.request_url}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-[#F1F5F9] px-4 py-3">
              <p className="text-[11px] text-[#94A3B8]">
                Page {meta.current_page} of {meta.last_page} · {meta.total} entries
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}

      {selected ? (
        <div className="fixed inset-0 z-[600] flex justify-end bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={LEVEL_TONE[selected.level] || 'slate'}>{selected.level}</Badge>
                  <Badge tone="slate">{selected.category}</Badge>
                </div>
                <h3 className="mt-2 text-[16px] font-semibold text-[#0F172A]">Log detail</h3>
                <p className="text-[11px] text-[#94A3B8]">{formatDate(selected.created_at)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>

            <div className="mt-5 space-y-4 text-[12px]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">Message</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[#0F172A]">{selected.message}</p>
              </div>
              {selected.exception_class ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">Exception</p>
                  <p className="mt-1 font-mono text-[11px] text-[#DC2626]">{selected.exception_class}</p>
                </div>
              ) : null}
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ['Source', selected.source || '—'],
                  ['IP', selected.ip || '—'],
                  ['Method', selected.http_method || '—'],
                  ['Status', selected.http_status || '—'],
                  ['User', selected.user_id || 'guest'],
                  ['Request', selected.request_url || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-[#F1F5F9] px-2.5 py-2">
                    <dt className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">{k}</dt>
                    <dd className="mt-0.5 truncate font-mono text-[11px] text-[#334155]" title={String(v)}>{String(v)}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">Stack trace</p>
                {detail ? (
                  detail.stack_trace ? (
                    <pre className="mt-1 max-h-72 overflow-auto rounded-xl bg-[#0F172A] p-3 font-mono text-[10px] leading-relaxed text-[#E2E8F0]">
                      {detail.stack_trace}
                    </pre>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#94A3B8]">No stack trace recorded.</p>
                  )
                ) : (
                  <p className="mt-1 text-[11px] text-[#94A3B8]">Loading trace…</p>
                )}
              </div>
              {selected.context && Object.keys(selected.context).length ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">Context</p>
                  <pre className="mt-1 max-h-56 overflow-auto rounded-xl bg-[#F8FAFC] p-3 font-mono text-[10px] leading-relaxed text-[#475569]">
                    {JSON.stringify(selected.context, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
