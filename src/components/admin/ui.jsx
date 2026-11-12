'use client';

export function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
        padded ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-[15px] font-semibold text-[#0F172A]">{title}</h2>
        {subtitle ? <p className="text-[12px] text-[#64748B] mt-0.5">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
    green: 'bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]',
    amber: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]',
    red: 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]',
    violet: 'bg-[#F5F3FF] text-[#7C3AED] border-[#EDE9FE]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  title,
}) {
  const variants = {
    primary: 'bg-[#2563EB] text-[#FFFFFF] hover:bg-[#1D4ED8] border-[#2563EB]',
    secondary: 'bg-white text-[#0F172A] hover:bg-[#F8FAFC] border-[#E2E8F0]',
    danger: 'bg-[#DC2626] text-[#FFFFFF] hover:bg-[#B91C1C] border-[#DC2626]',
    ghost: 'bg-transparent text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] border-transparent',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[12px] rounded-lg',
    md: 'px-4 py-2 text-[13px] rounded-xl',
    lg: 'px-5 py-2.5 text-[14px] rounded-xl',
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-[#334155] mb-1.5">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-[#94A3B8] mt-1">{hint}</span> : null}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition ${
        props.className || ''
      }`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition ${
        props.className || ''
      }`}
    >
      {children}
    </select>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E2E8F0] bg-[#FBFDFF] px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <line x1="8" y1="5" x2="8" y2="8.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.6" fill="currentColor" />
        </svg>
      </span>
      <p className="text-[13px] font-semibold text-[#0F172A]">{title}</p>
      {message ? <p className="max-w-sm text-[12px] text-[#64748B]">{message}</p> : null}
      {action}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[12px] text-[#64748B]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#DBEAFE] border-t-[#2563EB]" />
      {label}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'blue', icon }) {
  const tones = {
    blue: 'bg-[#EFF6FF] text-[#2563EB]',
    green: 'bg-[#ECFDF5] text-[#059669]',
    amber: 'bg-[#FFFBEB] text-[#D97706]',
    red: 'bg-[#FEF2F2] text-[#DC2626]',
    violet: 'bg-[#F5F3FF] text-[#7C3AED]',
    slate: 'bg-[#F1F5F9] text-[#475569]',
  };
  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748B]">{label}</p>
        <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-[#0F172A]">{value}</p>
        {hint ? <p className="mt-1.5 text-[11px] text-[#94A3B8]">{hint}</p> : null}
      </div>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.blue}`}>
        {icon}
      </span>
    </Card>
  );
}

export function BarChart({ series = [], valueKey = 'count', secondaryKey, height = 140 }) {
  const max = Math.max(1, ...series.map((d) => Math.max(d[valueKey] || 0, secondaryKey ? d[secondaryKey] || 0 : 0)));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {series.map((d, i) => {
        const primary = Math.round(((d[valueKey] || 0) / max) * (height - 22));
        const secondary = secondaryKey ? Math.round(((d[secondaryKey] || 0) / max) * (height - 22)) : null;
        return (
          <div key={d.date || i} className="group relative flex flex-1 flex-col items-center justify-end gap-1">
            <div className="flex w-full items-end justify-center gap-0.5">
              {secondary !== null ? (
                <div
                  className="w-1/2 rounded-t-[3px] bg-[#DBEAFE]"
                  style={{ height: Math.max(2, secondary) }}
                  title={`${d.label || d.date}: ${d[secondaryKey]}`}
                />
              ) : null}
              <div
                className="w-1/2 rounded-t-[3px] bg-[#2563EB] transition-colors group-hover:bg-[#1D4ED8]"
                style={{ height: Math.max(2, primary) }}
                title={`${d.label || d.date}: ${d[valueKey]}`}
              />
            </div>
            <span className="hidden text-[9px] text-[#94A3B8] sm:block">{d.label || ''}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressRow({ label, value, max, tone = 'blue' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const tones = {
    blue: 'bg-[#2563EB]',
    green: 'bg-[#059669]',
    amber: 'bg-[#D97706]',
    red: 'bg-[#DC2626]',
    violet: 'bg-[#7C3AED]',
  };
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="truncate text-[#334155]">{label}</span>
        <span className="tabular-nums text-[#64748B]">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
        <div className={`h-full rounded-full ${tones[tone] || tones.blue}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function timeAgo(value) {
  if (!value) return '—';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(value, withTime = true) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
