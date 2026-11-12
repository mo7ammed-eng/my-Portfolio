'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import {
  Badge,
  BarChart,
  Button,
  Card,
  EmptyState,
  ProgressRow,
  SectionHeader,
  Spinner,
  StatCard,
  timeAgo,
} from '@/components/admin/ui';

const RANGES = [
  { key: '1d', label: '24 hours' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
];

const STATUS_TONE = { published: 'green', pending: 'amber', hidden: 'slate', rejected: 'red' };

export default function AdminDashboardPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshedAt, setRefreshedAt] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await adminFetch(`/dashboard/stats?range=${range}`);
    if (res.ok) {
      setData(res.data);
      setError('');
      setRefreshedAt(new Date());
    } else {
      setError(errorMessage(res, 'Could not load dashboard metrics.'));
    }
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), 20000);
    return () => clearInterval(id);
  }, [load]);

  if (loading && !data) return <Spinner label="Loading platform metrics…" />;

  const totals = data?.totals || {};
  const charts = data?.charts || {};
  const requestSeries = charts.requests || [];
  const visitorSeries = charts.visitors || [];
  const merged = requestSeries.map((d, i) => ({
    ...d,
    visitors: visitorSeries[i]?.count || 0,
  }));
  const sources = charts.sources || [];
  const topPages = charts.top_pages || [];
  const statuses = charts.repository_statuses || [];
  const maxSource = Math.max(1, ...sources.map((s) => s.count));
  const maxPage = Math.max(1, ...topPages.map((p) => p.count));

  return (
    <div className="space-y-6">
      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => load()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                range === r.key ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
          {refreshedAt ? <span>Updated {timeAgo(refreshedAt)}</span> : null}
          <Button size="sm" variant="secondary" onClick={() => load(true)}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Visitors"
          value={totals.visitors_in_range ?? 0}
          hint={`${totals.active_sessions ?? 0} active now`}
          tone="blue"
          icon={<PulseIcon />}
        />
        <StatCard
          label="Requests"
          value={totals.requests ?? 0}
          hint={`${totals.api_requests ?? 0} from integrations`}
          tone="violet"
          icon={<RouteIcon />}
        />
        <StatCard
          label="Errors"
          value={totals.errors ?? 0}
          hint={`${totals.critical_errors ?? 0} critical`}
          tone={totals.errors ? 'red' : 'green'}
          icon={<AlertIcon />}
        />
        <StatCard
          label="Published repos"
          value={totals.published_repositories ?? 0}
          hint={`${totals.pending_repositories ?? 0} pending review`}
          tone="green"
          icon={<RepoIcon />}
        />
        <StatCard
          label="Blocked"
          value={`${totals.blocked_ips ?? 0} / ${totals.blocked_users ?? 0}`}
          hint="IPs / users"
          tone="amber"
          icon={<ShieldIcon />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader
            title="Traffic"
            subtitle="Requests and unique visitors over the selected range"
            action={
              <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" /> Requests
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#DBEAFE]" /> Visitors
                </span>
              </div>
            }
          />
          {merged.length ? (
            <BarChart series={merged} valueKey="count" secondaryKey="visitors" height={168} />
          ) : (
            <EmptyState title="No traffic in this range" message="Requests will appear as visitors browse the site." />
          )}
        </Card>

        <Card>
          <SectionHeader title="Repository health" subtitle="Publishing pipeline" />
          <div className="space-y-3">
            {statuses.length ? (
              statuses.map((s) => (
                <div key={s.status} className="flex items-center justify-between rounded-xl border border-[#F1F5F9] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Badge tone={STATUS_TONE[s.status] || 'slate'}>{s.status}</Badge>
                    <span className="text-[12px] text-[#64748B]">repositories</span>
                  </div>
                  <span className="text-[15px] font-semibold tabular-nums text-[#0F172A]">{s.count}</span>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-[#94A3B8]">No repositories imported yet.</p>
            )}
          </div>
          <div className="mt-4 border-t border-[#F1F5F9] pt-4">
            <Link
              href="/admin/github"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Manage GitHub integration <span aria-hidden>→</span>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <SectionHeader title="Traffic sources" subtitle="Where requests originate" />
          <div className="space-y-3">
            {sources.length ? (
              sources.slice(0, 6).map((s) => (
                <ProgressRow
                  key={s.source}
                  label={labelize(s.source)}
                  value={s.count}
                  max={maxSource}
                  tone={s.source === 'website' ? 'blue' : 'violet'}
                />
              ))
            ) : (
              <p className="text-[12px] text-[#94A3B8]">No request attribution yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Top pages" subtitle="Most requested routes" />
          <div className="space-y-3">
            {topPages.length ? (
              topPages.slice(0, 6).map((p) => (
                <ProgressRow key={p.path} label={p.path} value={p.count} max={maxPage} tone="green" />
              ))
            ) : (
              <p className="text-[12px] text-[#94A3B8]">No page views recorded.</p>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Recent logs"
            subtitle="Warnings and errors"
            action={
              <Link href="/admin/system" className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                Open console
              </Link>
            }
          />
          <div className="space-y-2.5">
            {data?.recent_logs?.length ? (
              data.recent_logs.map((log) => (
                <div key={log.uuid || log.id} className="rounded-xl border border-[#F1F5F9] px-3 py-2">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge tone={log.level === 'critical' || log.level === 'error' ? 'red' : 'amber'}>
                      {log.level}
                    </Badge>
                    <span className="text-[10px] uppercase tracking-wide text-[#94A3B8]">{log.category}</span>
                    <span className="ml-auto text-[10px] text-[#94A3B8]">{timeAgo(log.created_at)}</span>
                  </div>
                  <p className="line-clamp-1 text-[12px] text-[#334155]">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-[#94A3B8]">No warnings or errors. All clear.</p>
            )}
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <SectionHeader title="Recent requests" subtitle="Latest attributed API activity" />
          <Link href="/admin/requests" className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-y border-[#F1F5F9] text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">
                <th className="px-5 py-2.5 font-medium">Request</th>
                <th className="px-3 py-2.5 font-medium">Source</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Device</th>
                <th className="px-5 py-2.5 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_activity?.length ? (
                data.recent_activity.map((a) => (
                  <tr key={a.id} className="border-b border-[#F8FAFC] last:border-0">
                    <td className="px-5 py-3">
                      <span className="mr-2 inline-block w-12 text-[10px] font-semibold text-[#64748B]">{a.method}</span>
                      <span className="font-mono text-[12px] text-[#0F172A]">{a.path}</span>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-[#64748B]">{labelize(a.source)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={a.status >= 500 ? 'red' : a.status >= 400 ? 'amber' : 'green'}>{a.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-[12px] capitalize text-[#64748B]">
                      {a.device || '—'}
                      {a.browser ? <span className="text-[#CBD5E1]"> · {a.browser}</span> : null}
                    </td>
                    <td className="px-5 py-3 text-right text-[11px] text-[#94A3B8]">{timeAgo(a.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[12px] text-[#94A3B8]">
                    No requests captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function labelize(value) {
  if (!value) return 'Unknown';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function iconProps(size = 18) {
  return { width: size, height: size, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
}
function PulseIcon() {
  return (<svg {...iconProps()}><polyline points="1 10 5 10 7 4 10 16 12 10 19 10" /></svg>);
}
function RouteIcon() {
  return (<svg {...iconProps()}><circle cx="5" cy="15" r="2" /><circle cx="15" cy="5" r="2" /><path d="M7 15h4a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8" /></svg>);
}
function AlertIcon() {
  return (<svg {...iconProps()}><path d="M10 3 18 17H2L10 3z" /><line x1="10" y1="8" x2="10" y2="11.5" /><circle cx="10" cy="14" r="0.6" fill="currentColor" /></svg>);
}
function RepoIcon() {
  return (<svg {...iconProps()}><path d="M4 3h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4V3z" /><path d="M4 15a2 2 0 0 0 2 2h9" /><path d="M7 3v6l2-1.2L11 9V3" /></svg>);
}
function ShieldIcon() {
  return (<svg {...iconProps()}><path d="M10 2.5 16 4.7v5c0 3.4-2.4 6.1-6 7.8-3.6-1.7-6-4.4-6-7.8v-5l6-2.2z" /></svg>);
}
