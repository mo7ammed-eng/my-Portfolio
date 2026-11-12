'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import { Badge, Button, Card, EmptyState, Field, Input, SectionHeader, Select, Spinner, formatDate, timeAgo } from '@/components/admin/ui';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'ips', label: 'Blocked IPs' },
  { key: 'users', label: 'Blocked users' },
  { key: 'events', label: 'Events' },
  { key: 'audit', label: 'Audit log' },
];

const SEVERITY_TONE = { low: 'slate', medium: 'amber', high: 'red', critical: 'red' };

export default function AdminSecurityPage() {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [ips, setIps] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(null);

  const [ipForm, setIpForm] = useState({ ip: '', reason: '', hours: '24', permanent: false });
  const [userForm, setUserForm] = useState({ user_id: '', reason: '', hours: '24', permanent: false });
  const [eventFilter, setEventFilter] = useState({ severity: '', type: '' });
  const [auditQuery, setAuditQuery] = useState('');

  const loadSummary = useCallback(async () => {
    const res = await adminFetch('/security/summary');
    if (res.ok) setSummary(res.data);
  }, []);

  const loadIps = useCallback(async () => {
    const res = await adminFetch('/security/blocked-ips?state=all');
    if (res.ok) setIps(res.data?.data || []);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await adminFetch('/security/blocked-users?state=all');
    if (res.ok) setUsers(res.data?.data || []);
  }, []);

  const loadEvents = useCallback(async () => {
    const params = new URLSearchParams();
    if (eventFilter.severity) params.set('severity', eventFilter.severity);
    if (eventFilter.type) params.set('type', eventFilter.type);
    const res = await adminFetch(`/security/events?${params.toString()}`);
    if (res.ok) setEvents(res.data?.data || []);
  }, [eventFilter]);

  const loadAudit = useCallback(async () => {
    const res = await adminFetch(`/security/audit-logs${auditQuery ? `?action=${encodeURIComponent(auditQuery)}` : ''}`);
    if (res.ok) setAudit(res.data?.data || []);
  }, [auditQuery]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/security/summary');
    if (!res.ok) setError(errorMessage(res, 'Could not load security data.'));
    await Promise.all([loadSummary(), loadIps(), loadUsers(), loadEvents(), loadAudit()]);
    setLoading(false);
  }, [loadSummary, loadIps, loadUsers, loadEvents, loadAudit]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (tab === 'events') loadEvents(); }, [tab, loadEvents]);
  useEffect(() => { if (tab === 'audit') loadAudit(); }, [tab, loadAudit]);

  const blockIp = async (e) => {
    e.preventDefault();
    setBusy('ip');
    setError('');
    setNotice('');
    const expires_at = ipForm.permanent
      ? null
      : new Date(Date.now() + Number(ipForm.hours) * 3600000).toISOString();
    const res = await adminFetch('/security/blocked-ips', {
      method: 'POST',
      body: JSON.stringify({
        ip: ipForm.ip.trim(),
        reason: ipForm.reason || null,
        is_permanent: ipForm.permanent,
        expires_at,
      }),
    });
    if (res.ok) {
      setNotice(`Blocked ${ipForm.ip}.`);
      setIpForm({ ip: '', reason: '', hours: '24', permanent: false });
      await Promise.all([loadSummary(), loadIps()]);
    } else {
      setError(errorMessage(res, 'Could not block IP.'));
    }
    setBusy(null);
  };

  const unblockIp = async (row) => {
    setBusy(`ip-${row.id}`);
    const res = await adminFetch(`/security/blocked-ips/${row.id}`, { method: 'DELETE' });
    if (res.ok) {
      await Promise.all([loadSummary(), loadIps()]);
      setNotice(`Unblocked ${row.ip}.`);
    } else {
      setError(errorMessage(res, 'Could not unblock IP.'));
    }
    setBusy(null);
  };

  const blockUser = async (e) => {
    e.preventDefault();
    setBusy('user');
    setError('');
    setNotice('');
    const expires_at = userForm.permanent
      ? null
      : new Date(Date.now() + Number(userForm.hours) * 3600000).toISOString();
    const res = await adminFetch('/security/blocked-users', {
      method: 'POST',
      body: JSON.stringify({
        user_id: Number(userForm.user_id),
        reason: userForm.reason || null,
        is_permanent: userForm.permanent,
        expires_at,
      }),
    });
    if (res.ok) {
      setNotice(`Blocked user #${userForm.user_id}.`);
      setUserForm({ user_id: '', reason: '', hours: '24', permanent: false });
      await Promise.all([loadSummary(), loadUsers()]);
    } else {
      setError(errorMessage(res, 'Could not block user.'));
    }
    setBusy(null);
  };

  const unblockUser = async (row) => {
    setBusy(`user-${row.id}`);
    const res = await adminFetch(`/security/blocked-users/${row.id}`, { method: 'DELETE' });
    if (res.ok) {
      await Promise.all([loadSummary(), loadUsers()]);
      setNotice(`Unblocked user #${row.user_id}.`);
    } else {
      setError(errorMessage(res, 'Could not unblock user.'));
    }
    setBusy(null);
  };

  const totals = summary?.totals || {};

  if (loading && !summary) return <Spinner label="Loading security overview…" />;

  return (
    <div className="space-y-5">
      {error ? <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#047857]">{notice}</div> : null}

      <div className="inline-flex flex-wrap rounded-xl border border-[#E2E8F0] bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
              tab === t.key ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Blocked IPs', totals.blocked_ips, 'amber'],
              ['Blocked users', totals.blocked_users, 'red'],
              ['Events (7d)', totals.events_7d, 'blue'],
              ['Critical events (7d)', totals.critical_events_7d, 'red'],
            ].map(([label, value, tone]) => (
              <Card key={label}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748B]">{label}</p>
                <p className="mt-1.5 text-[26px] font-semibold leading-none text-[#0F172A]">{value ?? 0}</p>
                <div className="mt-2"><Badge tone={tone}>last 7 days</Badge></div>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <SectionHeader title="Event types" subtitle="What is triggering alerts" />
              <div className="space-y-2">
                {(summary?.by_type || []).length ? (
                  summary.by_type.map((t) => (
                    <div key={t.type} className="flex items-center justify-between rounded-lg border border-[#F1F5F9] px-2.5 py-2">
                      <span className="text-[12px] text-[#334155]">{t.type.replaceAll('_', ' ')}</span>
                      <Badge tone="slate">{t.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-[#94A3B8]">No events in the last 7 days.</p>
                )}
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <SectionHeader title="Recent security events" subtitle="Newest first" />
              <div className="space-y-2">
                {(summary?.recent_events?.data || summary?.recent_events || []).length ? (
                  (summary.recent_events.data || summary.recent_events).slice(0, 8).map((ev) => (
                    <div key={ev.id} className="flex items-start gap-2.5 rounded-lg border border-[#F1F5F9] px-2.5 py-2">
                      <Badge tone={SEVERITY_TONE[ev.severity] || 'slate'}>{ev.severity}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] text-[#0F172A]">{ev.description}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          {ev.type} {ev.ip ? `· ${ev.ip}` : ''} · {timeAgo(ev.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-[#94A3B8]">No security events recorded.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === 'ips' ? (
        <div className="space-y-4">
          <Card>
            <SectionHeader title="Block an IP address" subtitle="Blocking is enforced by MonitorRequest on every API request." />
            <form onSubmit={blockIp} className="grid gap-3 md:grid-cols-[1fr_1.6fr_0.7fr_auto] md:items-end">
              <Field label="IP address">
                <Input value={ipForm.ip} onChange={(e) => setIpForm({ ...ipForm, ip: e.target.value })} placeholder="203.0.113.10" required />
              </Field>
              <Field label="Reason">
                <Input value={ipForm.reason} onChange={(e) => setIpForm({ ...ipForm, reason: e.target.value })} placeholder="Abuse, scraping…" />
              </Field>
              <Field label="Duration (hours)">
                <Input
                  type="number"
                  min="1"
                  value={ipForm.hours}
                  onChange={(e) => setIpForm({ ...ipForm, hours: e.target.value })}
                  disabled={ipForm.permanent}
                />
              </Field>
              <div className="flex items-center gap-2 pb-0.5">
                <label className="flex items-center gap-1.5 text-[12px] text-[#475569]">
                  <input
                    type="checkbox"
                    checked={ipForm.permanent}
                    onChange={(e) => setIpForm({ ...ipForm, permanent: e.target.checked })}
                  />
                  Permanent
                </label>
                <Button type="submit" disabled={busy === 'ip'}>{busy === 'ip' ? 'Blocking…' : 'Block'}</Button>
              </div>
            </form>
          </Card>

          <Card padded={false}>
            <div className="px-5 pt-5 pb-2"><SectionHeader title="Blocked IPs" subtitle="Active and historical" /></div>
            <div className="divide-y divide-[#F1F5F9]">
              {ips.length ? ips.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-[160px] flex-1">
                    <p className="font-mono text-[12px] text-[#0F172A]">{row.ip}</p>
                    <p className="text-[10px] text-[#94A3B8]">{row.reason || 'No reason provided'}</p>
                  </div>
                  <Badge tone={row.is_active ? 'red' : 'slate'}>{row.is_active ? 'active' : 'inactive'}</Badge>
                  <Badge tone="slate">{row.is_permanent ? 'permanent' : row.expires_at ? `until ${formatDate(row.expires_at)}` : 'temporary'}</Badge>
                  {row.is_active ? (
                    <Button size="sm" variant="secondary" onClick={() => unblockIp(row)} disabled={busy === `ip-${row.id}`}>
                      Unblock
                    </Button>
                  ) : null}
                </div>
              )) : <p className="px-5 py-8 text-center text-[12px] text-[#94A3B8]">No blocked IPs.</p>}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'users' ? (
        <div className="space-y-4">
          <Card>
            <SectionHeader title="Block a user" subtitle="Requires the numeric user ID." />
            <form onSubmit={blockUser} className="grid gap-3 md:grid-cols-[0.8fr_1.6fr_0.7fr_auto] md:items-end">
              <Field label="User ID">
                <Input
                  type="number"
                  min="1"
                  value={userForm.user_id}
                  onChange={(e) => setUserForm({ ...userForm, user_id: e.target.value })}
                  placeholder="2"
                  required
                />
              </Field>
              <Field label="Reason">
                <Input value={userForm.reason} onChange={(e) => setUserForm({ ...userForm, reason: e.target.value })} placeholder="Policy violation" />
              </Field>
              <Field label="Duration (hours)">
                <Input
                  type="number"
                  min="1"
                  value={userForm.hours}
                  onChange={(e) => setUserForm({ ...userForm, hours: e.target.value })}
                  disabled={userForm.permanent}
                />
              </Field>
              <div className="flex items-center gap-2 pb-0.5">
                <label className="flex items-center gap-1.5 text-[12px] text-[#475569]">
                  <input
                    type="checkbox"
                    checked={userForm.permanent}
                    onChange={(e) => setUserForm({ ...userForm, permanent: e.target.checked })}
                  />
                  Permanent
                </label>
                <Button type="submit" disabled={busy === 'user'}>{busy === 'user' ? 'Blocking…' : 'Block'}</Button>
              </div>
            </form>
          </Card>

          <Card padded={false}>
            <div className="px-5 pt-5 pb-2"><SectionHeader title="Blocked users" subtitle="Active and historical" /></div>
            <div className="divide-y divide-[#F1F5F9]">
              {users.length ? users.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-[200px] flex-1">
                    <p className="text-[12px] text-[#0F172A]">{row.user?.email || `User #${row.user_id}`}</p>
                    <p className="text-[10px] text-[#94A3B8]">{row.reason || 'No reason provided'}</p>
                  </div>
                  <Badge tone={row.is_active ? 'red' : 'slate'}>{row.is_active ? 'active' : 'inactive'}</Badge>
                  {row.is_active ? (
                    <Button size="sm" variant="secondary" onClick={() => unblockUser(row)} disabled={busy === `user-${row.id}`}>
                      Unblock
                    </Button>
                  ) : null}
                </div>
              )) : <p className="px-5 py-8 text-center text-[12px] text-[#94A3B8]">No blocked users.</p>}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'events' ? (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Severity">
                <Select value={eventFilter.severity} onChange={(e) => setEventFilter({ ...eventFilter, severity: e.target.value })}>
                  <option value="">Any</option>
                  {['low', 'medium', 'high', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Type">
                <Input value={eventFilter.type} onChange={(e) => setEventFilter({ ...eventFilter, type: e.target.value })} placeholder="ip_blocked" />
              </Field>
              <Button variant="secondary" onClick={loadEvents}>Apply</Button>
            </div>
          </Card>
          <Card padded={false}>
            <div className="divide-y divide-[#F1F5F9]">
              {events.length ? events.map((ev) => (
                <div key={ev.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                  <Badge tone={SEVERITY_TONE[ev.severity] || 'slate'}>{ev.severity}</Badge>
                  <div className="min-w-[220px] flex-1">
                    <p className="text-[12px] text-[#0F172A]">{ev.description}</p>
                    <p className="text-[10px] text-[#94A3B8]">
                      {ev.type}
                      {ev.ip ? ` · ${ev.ip}` : ''}
                      {ev.user_id ? ` · user #${ev.user_id}` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">{timeAgo(ev.created_at)}</span>
                </div>
              )) : <p className="px-5 py-8 text-center text-[12px] text-[#94A3B8]">No events match.</p>}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'audit' ? (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Action contains">
                <Input value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} placeholder="github.sync" />
              </Field>
              <Button variant="secondary" onClick={loadAudit}>Search</Button>
            </div>
          </Card>
          <Card padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-3 py-3 font-medium">Description</th>
                    <th className="px-3 py-3 font-medium">Admin</th>
                    <th className="px-5 py-3 text-right font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.length ? audit.map((row) => (
                    <tr key={row.id} className="border-b border-[#F8FAFC] last:border-0">
                      <td className="px-5 py-3"><Badge tone="blue">{row.action}</Badge></td>
                      <td className="px-3 py-3 text-[12px] text-[#334155]">{row.description || '—'}</td>
                      <td className="px-3 py-3 text-[12px] text-[#64748B]">{row.admin || 'system'}</td>
                      <td className="px-5 py-3 text-right text-[11px] text-[#94A3B8]">{timeAgo(row.created_at)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-[12px] text-[#94A3B8]">No audit entries.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
