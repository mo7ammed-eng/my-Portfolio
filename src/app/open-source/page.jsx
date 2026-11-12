'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiGithub, FiSearch, FiStar, FiGitBranch, FiArrowUpRight, FiCode, FiClock, FiFilter } from 'react-icons/fi';

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'updated', label: 'Recently pushed' },
  { key: 'stars', label: 'Most starred' },
  { key: 'name', label: 'A–Z' },
];

export default function OpenSourcePage() {
  const [repos, setRepos] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');
  const [language, setLanguage] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page: String(page), per_page: '12' });
    if (language) params.set('language', language);
    if (query) params.set('q', query);
    try {
      const res = await fetch(`/api/github/repositories?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not load repositories.');
      setRepos(data.data || []);
      setMeta(data.meta || null);
      setError('');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [sort, page, language, query]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch('/api/github/languages')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLanguages(d?.languages || []))
      .catch(() => {});
  }, []);

  const featured = useMemo(() => repos.filter((r) => r.is_featured).slice(0, 1)[0], [repos]);
  const totalStars = useMemo(() => repos.reduce((sum, r) => sum + (r.stars || 0), 0), [repos]);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="relative overflow-hidden rounded-[32px] border border-white/8 bg-white/[0.025] p-7 md:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--primary)]/15 blur-[90px]" />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/50">
            <FiGithub size={12} /> Open source
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tighter text-white md:text-6xl">
            Code, systems and
            <br />
            <span className="text-white/30">things I ship in public.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-white/50 md:text-lg">
            Every published repository is served from the same platform that powers this portfolio — with live metadata,
            file browsing and a review workflow behind it.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5 text-[11px] uppercase tracking-[0.18em] text-white/35">
            <span>{meta?.total ?? repos.length} repositories</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>{totalStars.toLocaleString()} stars on this page</span>
            {process.env.NEXT_PUBLIC_GITHUB_USERNAME ? (
              <>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <a
                  href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:text-white transition-colors"
                >
                  GitHub profile <FiArrowUpRight size={12} />
                </a>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {featured ? (
        <Link
          href={`/open-source/${featured.owner}/${featured.name}`}
          className="group mt-5 flex flex-col gap-4 rounded-3xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.06] p-5 transition-colors hover:bg-[var(--primary)]/[0.1] md:flex-row md:items-center md:p-6"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)]">
            <FiCode size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--primary)]">Featured repository</p>
            <p className="mt-1 truncate text-lg font-semibold text-white">{featured.full_name}</p>
            <p className="line-clamp-1 text-[13px] text-white/45">{featured.description || 'No description.'}</p>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-white/50">
            {featured.language ? <span>{featured.language}</span> : null}
            <span className="inline-flex items-center gap-1.5"><FiStar size={12} /> {featured.stars}</span>
            <span className="inline-flex items-center gap-1.5"><FiGitBranch size={12} /> {featured.forks}</span>
            <FiArrowUpRight className="text-white/30 transition-colors group-hover:text-[var(--primary)]" />
          </div>
        </Link>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}
          className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5"
        >
          <FiSearch className="text-white/30" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories, language, description…"
            className="w-full bg-transparent text-[13px] text-white placeholder-white/25 outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/30">
            <FiFilter size={12} /> Sort
          </span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => { setSort(s.key); setPage(1); }}
              className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                sort === s.key
                  ? 'border-[var(--primary)]/40 bg-[var(--primary)]/15 text-[var(--primary)]'
                  : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {languages.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => { setLanguage(''); setPage(1); }}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              !language ? 'border-white/20 bg-white/10 text-white' : 'border-white/8 text-white/40 hover:text-white/70'
            }`}
          >
            All languages
          </button>
          {languages.slice(0, 10).map((l) => (
            <button
              key={l.language}
              onClick={() => { setLanguage(l.language === language ? '' : l.language); setPage(1); }}
              className={`rounded-full border px-3 py-1 text-[11px] ${
                language === l.language
                  ? 'border-[var(--primary)]/40 bg-[var(--primary)]/15 text-[var(--primary)]'
                  : 'border-white/8 text-white/40 hover:text-white/70'
              }`}
            >
              {l.language} <span className="text-white/25">{l.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-300">{error}</div>
      ) : null}

      {loading && !repos.length ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl border border-white/5 bg-white/[0.03]" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-white/10 py-16 text-center">
          <FiGithub size={26} className="mx-auto text-white/20" />
          <p className="mt-3 text-sm text-white/50">No published repositories match those filters.</p>
          <p className="text-[12px] text-white/25">Try another language or clear the search.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {repos.map((repo) => (
            <Link
              key={repo.id}
              href={`/open-source/${repo.owner}/${repo.name}`}
              className="group flex flex-col rounded-3xl border border-white/8 bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white group-hover:text-[var(--primary)] transition-colors">
                    {repo.name}
                  </p>
                  <p className="text-[11px] text-white/30">{repo.owner}</p>
                </div>
                <FiArrowUpRight className="shrink-0 text-white/20 transition-colors group-hover:text-[var(--primary)]" />
              </div>

              <p className="mt-3 line-clamp-2 min-h-[38px] text-[12px] leading-relaxed text-white/45">
                {repo.description || 'No description provided.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {repo.language ? (
                  <span className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] text-white/50">{repo.language}</span>
                ) : null}
                {(repo.topics || []).slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] text-white/35">{t}</span>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-4 border-t border-white/5 pt-3 text-[11px] text-white/35">
                <span className="inline-flex items-center gap-1"><FiStar size={11} /> {repo.stars}</span>
                <span className="inline-flex items-center gap-1"><FiGitBranch size={11} /> {repo.forks}</span>
                <span className="ml-auto inline-flex items-center gap-1"><FiClock size={11} /> {timeAgo(repo.github_pushed_at || repo.synced_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-3">
          <p className="text-[11px] text-white/30">Page {meta.current_page} of {meta.last_page}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] text-white/60 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.last_page}
              className="rounded-full border border-white/10 px-4 py-1.5 text-[11px] text-white/60 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function timeAgo(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
