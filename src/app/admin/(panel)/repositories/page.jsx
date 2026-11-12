'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import { Badge, Button, Card, EmptyState, Field, Input, SectionHeader, Select, Spinner, timeAgo } from '@/components/admin/ui';

const STATUS_TONE = { published: 'green', pending: 'amber', hidden: 'slate', rejected: 'red' };
const STATUSES = ['published', 'pending', 'hidden', 'rejected'];

export default function AdminRepositoriesPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('display');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), sort, per_page: '12' });
    if (status) params.set('status', status);
    if (query) params.set('q', query);
    const res = await adminFetch(`/github/repositories?${params.toString()}`);
    if (res.ok) {
      setItems(res.data?.data || []);
      setMeta(res.data?.meta || null);
      setError('');
    } else {
      setError(errorMessage(res, 'Could not load repositories.'));
    }
    setLoading(false);
  }, [page, sort, status, query]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (repo, payload) => {
    setBusyId(repo.id);
    const res = await adminFetch(`/github/repositories/${repo.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setItems((prev) => prev.map((r) => (r.id === repo.id ? res.data.repository : r)));
      setError('');
    } else {
      setError(errorMessage(res, 'Update failed.'));
    }
    setBusyId(null);
  };

  const refresh = async (repo) => {
    setBusyId(repo.id);
    const res = await adminFetch(`/github/repositories/${repo.id}/refresh`, { method: 'POST' });
    if (res.ok) {
      setItems((prev) => prev.map((r) => (r.id === repo.id ? res.data.repository : r)));
    } else {
      setError(errorMessage(res, 'Refresh failed.'));
    }
    setBusyId(null);
  };

  const remove = async (repo) => {
    if (!window.confirm(`Delete the local record for ${repo.full_name}? This does not affect GitHub.`)) return;
    setBusyId(repo.id);
    const res = await adminFetch(`/github/repositories/${repo.id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((prev) => prev.filter((r) => r.id !== repo.id));
    } else {
      setError(errorMessage(res, 'Delete failed.'));
    }
    setBusyId(null);
  };

  const saveMeta = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await adminFetch(`/github/repositories/${editing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        description: editing.description || null,
        topics: (editing.topicsText || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 20),
      }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((r) => (r.id === editing.id ? res.data.repository : r)));
      setEditing(null);
    } else {
      setError(errorMessage(res, 'Could not save metadata.'));
    }
    setSaving(false);
  };

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">{error}</div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearch} className="flex flex-1 flex-wrap gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, owner, language…"
              className="max-w-xs flex-1"
            />
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-auto">
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="w-auto">
              <option value="display">Featured first</option>
              <option value="updated">Recently pushed</option>
              <option value="stars">Most stars</option>
              <option value="name">Name</option>
            </Select>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <Link href="/admin/github">
            <Button>Import repository</Button>
          </Link>
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading repositories…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No repositories found"
          message="Import a public repository or connect GitHub to populate your catalog."
          action={
            <Link href="/admin/github" className="mt-2">
              <Button size="sm">Open GitHub settings</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((repo) => (
            <Card key={repo.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/open-source/${repo.owner}/${repo.name}`}
                    className="block truncate text-[14px] font-semibold text-[#0F172A] hover:text-[#2563EB]"
                  >
                    {repo.name}
                  </Link>
                  <p className="truncate text-[11px] text-[#94A3B8]">{repo.owner}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={STATUS_TONE[repo.status] || 'slate'}>{repo.status}</Badge>
                  {repo.is_featured ? <Badge tone="violet">featured</Badge> : null}
                </div>
              </div>

              <p className="line-clamp-2 min-h-[32px] text-[12px] leading-relaxed text-[#64748B]">
                {repo.description || 'No description.'}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#94A3B8]">
                {repo.language ? <Badge tone="blue">{repo.language}</Badge> : null}
                <span>★ {repo.stars}</span>
                <span>⑂ {repo.forks}</span>
                {repo.visibility !== 'public' ? <Badge tone="amber">private</Badge> : null}
                <span className="ml-auto">{timeAgo(repo.github_pushed_at || repo.synced_at)}</span>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#F1F5F9] pt-3">
                <Select
                  value={repo.status}
                  onChange={(e) => patch(repo, { status: e.target.value })}
                  disabled={busyId === repo.id}
                  className="!py-1.5 !text-[12px]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant={repo.is_featured ? 'primary' : 'secondary'}
                    className="flex-1"
                    onClick={() => patch(repo, { is_featured: !repo.is_featured })}
                    disabled={busyId === repo.id}
                    title="Toggle featured"
                  >
                    ★
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => refresh(repo)}
                    disabled={busyId === repo.id}
                    title="Refresh from GitHub"
                  >
                    ↻
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setEditing({ ...repo, topicsText: (repo.topics || []).join(', ') })}
                    title="Edit metadata"
                  >
                    ✎
                  </Button>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-2">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                  >
                    GitHub ↗
                  </a>
                  <button
                    onClick={() => remove(repo)}
                    disabled={busyId === repo.id}
                    className="text-[11px] font-medium text-[#DC2626] hover:text-[#B91C1C] disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#94A3B8]">
            Page {meta.current_page} of {meta.last_page} · {meta.total} repositories
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-[#0F172A]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xl">
            <SectionHeader title={`Edit ${editing.full_name}`} subtitle="Overrides apply to the local catalog only." />
            <form onSubmit={saveMeta} className="space-y-4">
              <Field label="Description">
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  maxLength={5000}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </Field>
              <Field label="Topics" hint="Comma separated, up to 20">
                <Input
                  value={editing.topicsText || ''}
                  onChange={(e) => setEditing((prev) => ({ ...prev, topicsText: e.target.value }))}
                  placeholder="nextjs, typescript, ui"
                />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
