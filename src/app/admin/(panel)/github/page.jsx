'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import { Badge, Button, Card, EmptyState, Field, Input, SectionHeader, Spinner, timeAgo } from '@/components/admin/ui';

export default function AdminGithubPage() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fullName, setFullName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [statusRes, logsRes] = await Promise.all([
      adminFetch('/github/status'),
      adminFetch('/github/sync-logs?per_page=8'),
    ]);
    if (statusRes.ok) setStatus(statusRes.data);
    else setError(errorMessage(statusRes, 'Could not load GitHub status.'));
    if (logsRes.ok) setLogs(logsRes.data?.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setNotice('GitHub account connected. Repositories were imported automatically.');
      window.history.replaceState({}, '', '/admin/github');
    }
    if (params.get('error')) {
      setError(params.get('error'));
      window.history.replaceState({}, '', '/admin/github');
    }
  }, [load]);

  const run = async (key, fn) => {
    setBusy(key);
    setError('');
    setNotice('');
    try {
      await fn();
    } finally {
      setBusy('');
    }
  };

  const syncAll = () =>
    run('sync', async () => {
      const res = await adminFetch('/github/sync', { method: 'POST' });
      if (!res.ok) return setError(errorMessage(res, 'Sync failed.'));
      const s = res.data?.sync || {};
      setNotice(`Sync complete — ${s.synced ?? 0} synced, ${s.created ?? 0} new, ${s.failed ?? 0} failed.`);
      load();
    });

  const disconnect = () =>
    run('disconnect', async () => {
      if (!window.confirm('Disconnect the GitHub account? Existing repository records stay in place.')) return;
      const res = await adminFetch('/github/disconnect', { method: 'DELETE' });
      if (!res.ok) return setError(errorMessage(res, 'Could not disconnect.'));
      setNotice('GitHub account disconnected.');
      load();
    });

  const importRepo = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    run('import', async () => {
      const res = await adminFetch('/github/import', {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName.trim() }),
      });
      if (!res.ok) return setError(errorMessage(res, 'Import failed. Check the repository name.'));
      setNotice(`Imported ${res.data?.repository?.full_name}. Review it in Repositories.`);
      setFullName('');
      load();
    });
  };

  const account = status?.account;
  const counts = status?.counts || {};
  const webhookUrl = 'http://127.0.0.1:8000/api/github/webhook';

  if (loading && !status) return <Spinner label="Checking GitHub integration…" />;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">{error}</div>
      ) : null}
      {notice ? (
        <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#047857]">{notice}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="GitHub connection"
            subtitle="OAuth powers private-repo metadata, sync and webhook automation."
            action={
              account ? (
                <Badge tone="green">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" /> Connected
                </Badge>
              ) : (
                <Badge tone="amber">Not connected</Badge>
              )
            }
          />

          {account ? (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#F1F5F9] bg-[#FBFDFF] p-4">
              {account.avatar_url ? (
                <img src={account.avatar_url} alt={account.username} className="h-12 w-12 rounded-full border border-[#E2E8F0]" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B]">GH</span>
              )}
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#0F172A]">@{account.username}</p>
                <p className="text-[11px] text-[#64748B]">
                  Connected {timeAgo(account.connected_at)}
                  {account.last_synced_at ? ` · Last sync ${timeAgo(account.last_synced_at)}` : ''}
                </p>
                {account.scopes?.length ? (
                  <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">scopes: {account.scopes.join(', ')}</p>
                ) : null}
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button onClick={syncAll} disabled={busy === 'sync'}>
                  {busy === 'sync' ? 'Syncing…' : 'Sync all repositories'}
                </Button>
                <Button variant="secondary" onClick={disconnect} disabled={busy === 'disconnect'}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] leading-relaxed text-[#64748B]">
                Connect a GitHub account to import repositories automatically. Without OAuth you can still import any
                public repository manually below.
              </p>
              <Button
                onClick={() => {
                  window.location.href = '/api/admin/github/oauth/start';
                }}
                disabled={!status?.configured}
              >
                <GithubMark /> Connect GitHub
              </Button>
              {!status?.configured ? (
                <div className="rounded-xl border border-[#FEF3C7] bg-[#FFFBEB] p-3.5 text-[12px] leading-relaxed text-[#92400E]">
                  OAuth is not configured. Add <code className="font-mono">GITHUB_CLIENT_ID</code> and{' '}
                  <code className="font-mono">GITHUB_CLIENT_SECRET</code> to <code className="font-mono">api/.env</code>{' '}
                  and restart Laravel.
                </div>
              ) : null}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader title="Pipeline" subtitle="Repository review status" />
          <div className="grid grid-cols-2 gap-3">
            {[
              ['All', counts.all, 'slate'],
              ['Published', counts.published, 'green'],
              ['Pending', counts.pending, 'amber'],
              ['Hidden', counts.hidden, 'slate'],
              ['Rejected', counts.rejected, 'red'],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-xl border border-[#F1F5F9] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">{label}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[18px] font-semibold tabular-nums text-[#0F172A]">{value ?? 0}</span>
                  <Badge tone={tone}>repos</Badge>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/repositories"
            className="mt-4 inline-flex text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Review repositories →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader title="Import a repository" subtitle="Any public GitHub repository" />
          <form onSubmit={importRepo} className="space-y-3">
            <Field label="Repository" hint="Format: owner/repository">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="vercel/next.js"
                autoComplete="off"
              />
            </Field>
            <Button type="submit" disabled={busy === 'import' || !fullName.trim()}>
              {busy === 'import' ? 'Importing…' : 'Import repository'}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader title="Webhook" subtitle="Instant sync on push and repository events" />
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-medium text-[#334155]">Payload URL</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-[#F8FAFC] px-2.5 py-1.5 font-mono text-[11px] text-[#475569]">
                  {webhookUrl}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigator.clipboard?.writeText(webhookUrl)}
                  title="Copy webhook URL"
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#F1F5F9] px-3 py-2">
              <span className="text-[12px] text-[#64748B]">Secret configured</span>
              <Badge tone={status?.configured ? 'green' : 'amber'}>{status?.configured ? 'Yes' : 'No'}</Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-[#94A3B8]">
              Content type <code className="font-mono">application/json</code>. Events: push, repository, release.
              Set <code className="font-mono">GITHUB_WEBHOOK_SECRET</code> to enforce HMAC signatures.
            </p>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Setup checklist" subtitle="Environment" />
          <ul className="space-y-2 text-[12px] text-[#475569]">
            {[
              ['GITHUB_CLIENT_ID', Boolean(status?.configured)],
              ['GITHUB_CLIENT_SECRET', Boolean(status?.configured)],
              ['GITHUB_WEBHOOK_SECRET', Boolean(status?.configured)],
              ['GITHUB_TOKEN (optional read-only token)', Boolean(status?.has_token)],
            ].map(([label, ok]) => (
              <li key={label} className="flex items-center justify-between gap-2 rounded-lg border border-[#F1F5F9] px-2.5 py-1.5">
                <span className="font-mono text-[10px] text-[#64748B]">{label}</span>
                <Badge tone={ok ? 'green' : 'slate'}>{ok ? 'set' : 'missing'}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3">
          <SectionHeader title="Recent sync logs" subtitle="Newest GitHub synchronization attempts" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-y border-[#F1F5F9] text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">
                <th className="px-5 py-2.5 font-medium">Repository</th>
                <th className="px-3 py-2.5 font-medium">Action</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Message</th>
                <th className="px-5 py-2.5 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.length ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#F8FAFC] last:border-0">
                    <td className="px-5 py-3 text-[12px] font-medium text-[#0F172A]">
                      {log.repository?.full_name || log.repository_full_name || '—'}
                    </td>
                    <td className="px-3 py-3 text-[12px] text-[#64748B]">{log.action || log.event || 'sync'}</td>
                    <td className="px-3 py-3">
                      <Badge tone={log.status === 'success' ? 'green' : log.status === 'failed' ? 'red' : 'amber'}>
                        {log.status || 'info'}
                      </Badge>
                    </td>
                    <td className="max-w-[280px] truncate px-3 py-3 text-[12px] text-[#64748B]">{log.message || '—'}</td>
                    <td className="px-5 py-3 text-right text-[11px] text-[#94A3B8]">{timeAgo(log.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[12px] text-[#94A3B8]">
                    No sync activity yet.
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

function GithubMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
