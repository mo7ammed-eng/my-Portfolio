'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TITLES = {
  '/admin': ['Dashboard', 'Platform activity, visitors and repository health.'],
  '/admin/github': ['GitHub', 'Connect your account, sync repositories and configure webhooks.'],
  '/admin/repositories': ['Repositories', 'Control which repositories appear on your public site.'],
  '/admin/visitors': ['Visitors', 'Sessions, devices and browsing context.'],
  '/admin/requests': ['Requests', 'Every API request with source attribution.'],
  '/admin/system': ['System Console', 'Application logs, errors and diagnostics.'],
  '/admin/security': ['Security', 'Blocked addresses, events and audit trail.'],
  '/admin/api-clients': ['API Clients', 'Issue keys for trusted integrations.'],
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const match = TITLES[pathname];
  const title = match?.[0] || 'Admin';
  const subtitle = match?.[1] || 'Manage your portfolio platform.';

  return (
    <header className="admin-topbar sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mb-6 md:mb-8">
      <div className="flex items-center justify-between gap-4 pl-14 md:pl-0">
        <div className="min-w-0">
          <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-[#0F172A] truncate">
            {title}
          </h1>
          <p className="text-[13px] text-[#64748B] truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-1 text-[11px] font-medium text-[#059669]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            Live monitoring
          </span>
          <Link
            href="/open-source"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[12px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            Public site
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
