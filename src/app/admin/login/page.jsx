'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Invalid password. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-cursor min-h-screen bg-[#F6F8FB] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] grid md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#0F172A] p-8 text-[#FFFFFF]">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-sm font-black">
              MW
            </span>
            <h2 className="mt-6 text-[24px] font-semibold leading-tight tracking-tight">
              Developer platform
              <br />
              control room.
            </h2>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/70">
              Repository publishing, visitor intelligence, request attribution, security and system diagnostics in one
              place.
            </p>
          </div>
          <ul className="space-y-2 text-[12px] text-white/70">
            {['GitHub sync & webhooks', 'Live visitor sessions', 'Attributed API traffic', 'Security & audit trail'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2563EB]">Admin</p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[#0F172A]">Sign in</h1>
            <p className="mt-1 text-[13px] text-[#64748B]">Enter your admin password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#334155]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoFocus
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-3 text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]"
              />
            </label>

            {error ? <p className="text-[12px] text-[#DC2626]">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#2563EB] py-3 text-[13px] font-semibold text-[#FFFFFF] transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-[#94A3B8]">This page is not indexed by search engines.</p>
        </div>
      </div>
    </div>
  );
}
