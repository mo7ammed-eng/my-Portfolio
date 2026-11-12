'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: GridIcon }],
  },
  {
    label: 'Developer',
    items: [
      { label: 'GitHub', href: '/admin/github', icon: GithubIcon },
      { label: 'Repositories', href: '/admin/repositories', icon: FolderIcon },
    ],
  },
  {
    label: 'Audience',
    items: [
      { label: 'Visitors', href: '/admin/visitors', icon: UsersIcon },
      { label: 'Requests', href: '/admin/requests', icon: ActivityIcon },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'System Console', href: '/admin/system', icon: TerminalIcon },
      { label: 'Security', href: '/admin/security', icon: ShieldIcon },
      { label: 'API Clients', href: '/admin/api-clients', icon: KeyIcon },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Projects', href: '/admin/projects', icon: FolderIcon },
      { label: 'Content', href: '/admin/content', icon: FileTextIcon },
      { label: 'Inquiries', href: '/admin/inquiries', icon: InboxIcon },
      { label: 'Reviews', href: '/admin/reviews', icon: StarIcon },
      { label: 'Analytics', href: '/admin/analytics', icon: ChartIcon },
      { label: 'Links', href: '/admin/links', icon: LinkIcon },
      { label: 'Site', href: '/admin/site', icon: GearIcon },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCollapsed(localStorage.getItem('admin_sidebar_collapsed') === 'true');
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('admin-collapsed', collapsed);
    localStorage.setItem('admin_sidebar_collapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    document.body.classList.toggle('admin-mobile-open', mobileOpen);
    return () => document.body.classList.remove('admin-mobile-open');
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const isActive = (href) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[400] p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] md:hidden transition-all shadow-sm"
        aria-label="Open menu"
      >
        <MenuIcon size={20} />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[450] md:hidden"
        />
      )}

      <aside className="admin-sidebar fixed left-0 top-0 h-full flex-col z-[500]">
        <div className="px-5 py-5 border-b border-[#E2E8F0] flex items-center justify-between gap-2 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <span className="admin-logo-mark h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-sm font-black">
              MW
            </span>
            <span className="sidebar-label text-[#0F172A] font-semibold text-[13px] tracking-tight">
              Developer Platform
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-[#94A3B8] hover:text-[#0F172A] transition-colors"
            aria-label="Close menu"
          >
            <XIcon size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scroll">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="sidebar-subtext px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={label}
                      className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                        active
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="shrink-0">
                        <Icon size={16} />
                      </span>
                      <span className="sidebar-label">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-[#E2E8F0] space-y-0.5 shrink-0">
          <Link
            href="/"
            title="View site"
            className="sidebar-link flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <span className="shrink-0">
              <ExternalIcon size={16} />
            </span>
            <span className="sidebar-label">View site</span>
          </Link>

          <button
            onClick={logout}
            title="Sign out"
            className="sidebar-link w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
          >
            <span className="shrink-0">
              <LogoutIcon size={16} />
            </span>
            <span className="sidebar-label">Sign out</span>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            className="sidebar-link hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <span className="shrink-0">
              {collapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
            </span>
            <span className="sidebar-label">Collapse menu</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function iconProps(size) {
  return { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
}

function MenuIcon({ size = 18 }) {
  return (<svg {...iconProps(size)}><line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="14" y2="12" /></svg>);
}
function XIcon({ size = 18 }) {
  return (<svg {...iconProps(size)}><line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" /></svg>);
}
function ChevronLeftIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><polyline points="10 2 4 8 10 14" /></svg>);
}
function ChevronRightIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><polyline points="6 2 12 8 6 14" /></svg>);
}
function GridIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></svg>);
}
function GithubIcon({ size = 16 }) {
  return (<svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>);
}
function FolderIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><path d="M1 4a1 1 0 0 1 1-1h4l1.5 2H14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" /></svg>);
}
function UsersIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><circle cx="6" cy="5" r="2.4" /><path d="M1.5 14c0-2.2 2-3.8 4.5-3.8s4.5 1.6 4.5 3.8" /><path d="M11 3.2a2.3 2.3 0 0 1 0 4.3M12 10.4c1.6.4 2.7 1.6 2.7 3.1" /></svg>);
}
function ActivityIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><polyline points="1 8 4 8 6 3 9 13 11 8 15 8" /></svg>);
}
function TerminalIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><rect x="1.5" y="2.5" width="13" height="11" rx="2" /><polyline points="4 6 6.5 8 4 10" /><line x1="8" y1="10.5" x2="12" y2="10.5" /></svg>);
}
function ShieldIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><path d="M8 1.5 13 3.5v4.2c0 3.1-2.1 5.6-5 6.8-2.9-1.2-5-3.7-5-6.8V3.5l5-2z" /><path d="m5.8 7.6 1.4 1.4 3-3" /></svg>);
}
function KeyIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><circle cx="6" cy="6" r="3.2" /><path d="m8.5 8.5 4.5 4.5M11 11l1.2-1.2M12.7 12.7 14 11.4" /></svg>);
}
function FileTextIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><path d="M10.5 1.5H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5l-3.5-3.5z" /><path d="M10 1.5V5h3.5M5 8.5h6M5 11.5h6" /></svg>);
}
function InboxIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><polyline points="2 7 8 11 14 7" /><rect x="2" y="3" width="12" height="10" rx="2" /></svg>);
}
function StarIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><path d="m8 1.8 1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9L4.4 13l.7-4L2.2 6.1l4-.6L8 1.8z" /></svg>);
}
function ChartIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><line x1="3" y1="14" x2="3" y2="9" /><line x1="8" y1="14" x2="8" y2="4" /><line x1="13" y1="14" x2="13" y2="7" /></svg>);
}
function ExternalIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9M10 2h4v4M14 2 6 10" /></svg>);
}
function LogoutIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6" /></svg>);
}
function GearIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><circle cx="8" cy="8" r="2.2" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" /></svg>);
}
function LinkIcon({ size = 16 }) {
  return (<svg {...iconProps(size)}><path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" /><path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" /></svg>);
}
