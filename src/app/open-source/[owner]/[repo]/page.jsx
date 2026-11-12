'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiChevronRight,
  FiCode,
  FiDownload,
  FiFile,
  FiFolder,
  FiGitBranch,
  FiGithub,
  FiStar,
  FiBookOpen,
} from 'react-icons/fi';

export default function RepositoryPage() {
  const { owner, repo: repoName } = useParams();
  const [repo, setRepo] = useState(null);
  const [tree, setTree] = useState(null);
  const [treeLoading, setTreeLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [tab, setTab] = useState('readme');
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  const base = `/api/github/repositories/${owner}/${repoName}`;

  useEffect(() => {
    setError('');
    fetch(base)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message || 'Repository not found.');
        setRepo(data.repository);
      })
      .catch((e) => setError(e.message));
  }, [base]);

  const loadTree = useCallback(async (path = '') => {
    setTreeLoading(true);
    setFile(null);
    setFileError('');
    try {
      const res = await fetch(`${base}/tree?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not load directory.');
      setTree(data.entries || []);
      setCurrentPath(data.path || path);
    } catch (e) {
      setFileError(e.message);
      setTree([]);
    }
    setTreeLoading(false);
  }, [base]);

  useEffect(() => {
    if (repo) loadTree('');
  }, [repo, loadTree]);

  const openFile = async (path) => {
    setFileLoading(true);
    setFileError('');
    try {
      const res = await fetch(`${base}/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not load file.');
      setFile(data);
      setTab('code');
    } catch (e) {
      setFileError(e.message);
    }
    setFileLoading(false);
  };

  const crumbs = useMemo(() => currentPath.split('/').filter(Boolean), [currentPath]);
  const parentPath = crumbs.slice(0, -1).join('/');

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/open-source"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white"
      >
        <FiArrowLeft size={13} /> All repositories
      </Link>

      {error ? (
        <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/5 px-5 py-10 text-center">
          <FiGithub size={28} className="mx-auto text-white/20" />
          <p className="mt-3 text-lg font-semibold text-white">Repository unavailable</p>
          <p className="mt-1 text-[13px] text-white/40">{error}</p>
        </div>
      ) : !repo ? (
        <div className="mt-8 h-44 animate-pulse rounded-3xl border border-white/5 bg-white/[0.03]" />
      ) : (
        <>
          <header className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.025] p-6 md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/30">
                  <FiGithub size={12} />
                  <span>{repo.owner}</span>
                  <span className="text-white/15">/</span>
                  <span className="text-white/70">{repo.name}</span>
                  {repo.is_featured ? (
                    <span className="rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[var(--primary)]">
                      featured
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">{repo.name}</h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/45 md:text-[14px]">
                  {repo.description || 'No description provided.'}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-white/40">
                  {repo.language ? (
                    <span className="rounded-full border border-white/8 px-2.5 py-1 text-white/60">{repo.language}</span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5"><FiStar size={12} /> {repo.stars.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1.5"><FiGitBranch size={12} /> {repo.forks.toLocaleString()}</span>
                  <span>{repo.default_branch}</span>
                  {repo.visibility !== 'public' ? <span className="text-amber-300">private</span> : null}
                </div>

                {repo.topics?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {repo.topics.map((t) => (
                      <span key={t} className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] text-white/40">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  <FiGithub size={13} /> GitHub
                </a>
                <a
                  href={`${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition-transform hover:scale-[1.03]"
                >
                  <FiDownload size={13} /> Download
                </a>
              </div>
            </div>
          </header>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTab('readme')}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                tab === 'readme'
                  ? 'border-[var(--primary)]/40 bg-[var(--primary)]/15 text-[var(--primary)]'
                  : 'border-white/8 text-white/40 hover:text-white/70'
              }`}
            >
              <FiBookOpen size={13} /> Readme
            </button>
            <button
              onClick={() => setTab('code')}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                tab === 'code'
                  ? 'border-[var(--primary)]/40 bg-[var(--primary)]/15 text-[var(--primary)]'
                  : 'border-white/8 text-white/40 hover:text-white/70'
              }`}
            >
              <FiCode size={13} /> Code
            </button>
            {repo.last_sync_error ? (
              <span className="ml-auto text-[10px] text-amber-300/70">Sync warning: {repo.last_sync_error}</span>
            ) : null}
          </div>

          {tab === 'readme' ? (
            <section className="mt-4 rounded-3xl border border-white/8 bg-white/[0.02] p-5 md:p-8">
              {repo.readme ? (
                <article className="prose-invert max-w-none text-white/60">{renderMarkdown(repo.readme)}</article>
              ) : (
                <div className="py-12 text-center">
                  <FiBookOpen size={24} className="mx-auto text-white/20" />
                  <p className="mt-2 text-[13px] text-white/40">No README found for this repository.</p>
                </div>
              )}
            </section>
          ) : (
            <section className="mt-4 grid gap-4 lg:grid-cols-[300px_1fr]">
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-3">
                <div className="flex items-center gap-1.5 px-2 pb-2 text-[11px] text-white/35">
                  <Link href="#" onClick={(e) => { e.preventDefault(); loadTree(''); }} className="hover:text-white">
                    {repo.name}
                  </Link>
                  {crumbs.map((c, i) => (
                    <span key={`${c}-${i}`} className="flex items-center gap-1.5">
                      <FiChevronRight size={10} className="text-white/15" />
                      <button
                        onClick={() => { setTab('code'); loadTree(crumbs.slice(0, i + 1).join('/')); }}
                        className="hover:text-white"
                      >
                        {c}
                      </button>
                    </span>
                  ))}
                </div>

                {currentPath ? (
                  <button
                    onClick={() => loadTree(parentPath)}
                    className="mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12px] text-white/40 hover:bg-white/5 hover:text-white"
                  >
                    <FiArrowLeft size={12} /> ..
                  </button>
                ) : null}

                {treeLoading ? (
                  <div className="space-y-1.5 p-1.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-7 animate-pulse rounded-lg bg-white/5" />
                    ))}
                  </div>
                ) : tree?.length ? (
                  <div className="max-h-[520px] space-y-0.5 overflow-y-auto">
                    {tree.map((entry) => (
                      <button
                        key={entry.path}
                        onClick={() => {
                          if (entry.type === 'dir') {
                            setTab('code');
                            loadTree(entry.path);
                          } else {
                            openFile(entry.path);
                          }
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                          file?.path === entry.path
                            ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {entry.type === 'dir' ? (
                          <FiFolder size={13} className="shrink-0 text-[var(--primary)]/70" />
                        ) : (
                          <FiFile size={13} className="shrink-0 text-white/25" />
                        )}
                        <span className="truncate">{entry.name}</span>
                        {entry.type === 'file' ? (
                          <span className="ml-auto shrink-0 text-[9px] text-white/20">{formatSize(entry.size)}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-6 text-center text-[11px] text-white/30">This directory is empty.</p>
                )}
              </div>

              <div className="min-w-0 rounded-3xl border border-white/8 bg-white/[0.02]">
                {fileLoading ? (
                  <div className="flex h-64 items-center justify-center text-[12px] text-white/35">Loading file…</div>
                ) : file ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3 border-b border-white/8 px-4 py-3">
                      <span className="truncate font-mono text-[11px] text-white/60">{file.path}</span>
                      <span className="text-[10px] text-white/25">{formatSize(file.size)}</span>
                      {file.language ? (
                        <span className="rounded-full border border-white/8 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/40">
                          {file.language}
                        </span>
                      ) : null}
                      {file.html_url ? (
                        <a
                          href={file.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-[10px] text-white/30 hover:text-[var(--primary)]"
                        >
                          View on GitHub <FiArrowUpRight size={11} />
                        </a>
                      ) : null}
                    </div>
                    {file.too_large ? (
                      <div className="flex h-64 flex-col items-center justify-center gap-2 text-white/35">
                        <FiFile size={24} className="text-white/20" />
                        <p className="text-[13px]">This file is too large to preview.</p>
                        {file.html_url ? (
                          <a href={file.html_url} target="_blank" rel="noreferrer" className="text-[12px] text-[var(--primary)]">
                            Open on GitHub
                          </a>
                        ) : null}
                      </div>
                    ) : file.binary ? (
                      <div className="flex h-64 flex-col items-center justify-center gap-2 text-white/35">
                        <FiFile size={24} className="text-white/20" />
                        <p className="text-[13px]">Binary file — preview unavailable.</p>
                        {file.html_url ? (
                          <a href={file.html_url} target="_blank" rel="noreferrer" className="text-[12px] text-[var(--primary)]">
                            Download from GitHub
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <pre className="max-h-[560px] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-[#C9D1D9]">
                        <code>{file.content}</code>
                      </pre>
                    )}
                  </>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center gap-2 text-white/30">
                    <FiCode size={24} className="text-white/20" />
                    <p className="text-[12px]">Select a file to view its contents.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {fileError ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[12px] text-red-300">
              {fileError}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderInline(text) {
  const nodes = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) nodes.push(<strong key={key++} className="text-white/85">{token.slice(2, -2)}</strong>);
    else if (token.startsWith('`')) nodes.push(<code key={key++} className="rounded bg-white/8 px-1 py-0.5 font-mono text-[0.9em] text-[var(--primary)]">{token.slice(1, -1)}</code>);
    else {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      nodes.push(
        <a key={key++} href={m[2]} target="_blank" rel="noreferrer" className="text-[var(--primary)] underline decoration-[var(--primary)]/30 hover:text-white">
          {m[1]}
        </a>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMarkdown(md) {
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre key={key++} className="my-4 overflow-x-auto rounded-2xl border border-white/8 bg-[#0D0D14] p-4 font-mono text-[11px] leading-relaxed text-[#C9D1D9]">
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s*/, '');
      const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-sm'];
      const Tag = `h${Math.min(level, 6)}`;
      out.push(
        <Tag key={key++} className={`mt-5 mb-2 font-semibold text-white ${sizes[level - 1]}`}>
          {renderInline(text)}
        </Tag>
      );
      i++;
      continue;
    }

    if (/^\s*[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s/, ''));
        i++;
      }
      out.push(
        <ul key={key++} className="my-3 list-disc space-y-1 pl-5 text-[13px] text-white/50">
          {items.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s/, ''));
        i++;
      }
      out.push(
        <ol key={key++} className="my-3 list-decimal space-y-1 pl-5 text-[13px] text-white/50">
          {items.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
        </ol>
      );
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    out.push(
      <p key={key++} className="my-2 text-[13px] leading-relaxed text-white/50">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return out;
}
