'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch, errorMessage } from '@/lib/adminClient';
import { Badge, Button, Card, EmptyState, Field, Input, SectionHeader, Select, Spinner, timeAgo } from '@/components/admin/ui';

const TYPES = ['website', 'whatsapp_bot', 'telegram_bot', 'mobile_app', 'external_api'];

export default function AdminApiClientsPage() {
  const [clients, setClients] = useState([]);
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'website', allowed_ips: '' });
  const [revealed, setRevealed] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [listRes, sourcesRes] = await Promise.all([
      adminFetch('/api-clients'),
      adminFetch('/api-clients/sources'),
    ]);
    if (listRes.ok) setClients(listRes.data?.data || []);
    else setError(errorMessage(listRes, 'Could not load API clients.'));
    if (sourcesRes.ok) setSources(sourcesRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setBusy('create');
    setError('');
    setNotice('');
    const allowed = form.allowed_ips
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await adminFetch('/api-clients', {
      method: 'POST',
      body: JSON.stringify({ name: form.name.trim(), type: form.type, allowed_ips: allowed.length ? allowed : null }),
    });
    if (res.ok) {
      setRevealed({ token: res.data.token, name: res.data.client?.name });
      setForm({ name: '', type: 'website', allowed_ips: '' });
      setNotice('API client created. Copy the token now — it will not be shown again.');
      load();
    } else {
      setError(errorMessage(res, 'Could not create API client.'));
    }
    setBusy(null);
  };

  const toggle = async (client) => {
    setBusy(`toggle-${client.id}`);
    const res = await adminFetch(`/api-clients/${client.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: !client.is_active }),
    });
    if (res.ok) setClients((prev) => prev.map((c) => (c.id === client.id ? res.data.client : c)));
    else setError(errorMessage(res, 'Update failed.'));
    setBusy(null);
  };

  const regenerate = async (client) => {
    if (!window.confirm(`Regenerate the token for ${client.name}? The previous token stops working immediately.`)) return;
    setBusy(`token-${client.id}`);
    const res = await adminFetch(`/api-clients/${client.id}/regenerate-token`, { method: 'POST' });
    if (res.ok) {
      setRevealed({ token: res.data.token, name: client.name });
      setNotice('Token regenerated. Copy it now — it will not be shown again.');
      load();
    } else {
      setError(errorMessage(res, 'Could not regenerate token.'));
    }
    setBusy(null);
  };

  const remove = async (client) => {
    if (!window.confirm(`Delete API client ${client.name}? Its token will stop working.`)) return;
    setBusy(`delete-${client.id}`);
    const res = await adminFetch(`/api-clients/${client.id}`, { method: 'DELETE' });
    if (res.ok) setClients((prev) => prev.filter((c) => c.id !== client.id));
    else setError(errorMessage(res, 'Delete failed.'));
    setBusy(null);
  };

  return (
    <div className="space-y-5">
      {error ? <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#047857]">{notice}</div> : null}

      {revealed ? (
        <Card className="border-[#DBEAFE] bg-[#EFF6FF]">
          <SectionHeader
            title={`Token for ${revealed.name}`}
            subtitle="Store this in your integration's environment now. It cannot be retrieved later."
            action={<Button size="sm" variant="secondary" onClick={() => setRevealed(null)}>Dismiss</Button>}
          />
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 font-mono text-[12px] text-[#1E3A8A]">
              {revealed.token}
            </code>
            <Button size="sm" onClick={() => navigator.clipboard?.writeText(revealed.token)}>Copy</Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader title="New API client" subtitle="Issue a hashed token for a trusted integration." />
          <form onSubmit={create} className="space-y-3">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Portfolio website" required />
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>)}
              </Select>
            </Field>
            <Field label="Allowed IPs" hint="Optional. Comma or space separated. Leave blank to allow any IP.">
              <Input value={form.allowed_ips} onChange={(e) => setForm({ ...form, allowed_ips: e.target.value })} placeholder="203.0.113.10, 10.0.0.0/24" />
            </Field>
            <Button type="submit" disabled={busy === 'create' || !form.name.trim()}>
              {busy === 'create' ? 'Creating…' : 'Create client'}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <SectionHeader title="Traffic by client" subtitle="Last 30 days" />
          {loading && !sources ? (
            <Spinner label="Loading sources…" />
          ) : (
            <div className="space-y-2">
              {(sources?.clients || []).length ? (
                sources.clients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-[#F1F5F9] px-2.5 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#334155]">{c.name}</span>
                      <Badge tone="slate">{c.type.replaceAll('_', ' ')}</Badge>
                    </div>
                    <span className="text-[12px] tabular-nums text-[#64748B]">{c.activities_count} requests</span>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[#94A3B8]">No attributed traffic in the last 30 days.</p>
              )}
              {(sources?.unattributed || []).length ? (
                <div className="mt-3 border-t border-[#F1F5F9] pt-3">
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">Unattributed sources</p>
                  {sources.unattributed.map((u) => (
                    <div key={u.source} className="flex items-center justify-between py-0.5 text-[11px] text-[#64748B]">
                      <span>{u.source || 'unknown'}</span>
                      <span className="tabular-nums">{u.count}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>

      {loading && !clients.length ? (
        <Spinner label="Loading API clients…" />
      ) : clients.length === 0 ? (
        <EmptyState title="No API clients yet" message="Create one to attribute requests from external integrations." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[10px] uppercase tracking-[0.08em] text-[#94A3B8]">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-3 py-3 font-medium">Token</th>
                  <th className="px-3 py-3 font-medium">Allowed IPs</th>
                  <th className="px-3 py-3 font-medium">State</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-[#F8FAFC] last:border-0">
                    <td className="px-5 py-3">
                      <p className="text-[12px] font-medium text-[#0F172A]">{client.name}</p>
                      <p className="text-[10px] text-[#94A3B8]">{client.type.replaceAll('_', ' ')} · {client.slug}</p>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-[#64748B]">{client.token_prefix}…</td>
                    <td className="px-3 py-3 text-[11px] text-[#64748B]">
                      {client.allowed_ips?.length ? client.allowed_ips.join(', ') : 'Any'}
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => toggle(client)} disabled={busy === `toggle-${client.id}`}>
                        <Badge tone={client.is_active ? 'green' : 'slate'}>{client.is_active ? 'active' : 'disabled'}</Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => regenerate(client)} disabled={busy === `token-${client.id}`}>
                          Rotate token
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(client)} disabled={busy === `delete-${client.id}`}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <SectionHeader title="Authentication" subtitle="How integrations use API client tokens" />
        <div className="space-y-2 text-[12px] text-[#475569]">
          <p>
            Send the token as <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[11px]">Authorization: Bearer &lt;token&gt;</code>{' '}
            or <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[11px]">X-API-Key: &lt;token&gt;</code>.
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            Tokens are stored as SHA-256 hashes. IP allowlists are enforced on each request. Rotating a token invalidates the previous one immediately.
          </p>
        </div>
      </Card>
    </div>
  );
}
