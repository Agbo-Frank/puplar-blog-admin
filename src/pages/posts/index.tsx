import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashTopBar } from '../../components/layout/top-bar';
import { Ic } from '../../components/icons';
import { StatusPill, Avatar, Thumb, Button } from '../../components/material';
import { ImportModal } from '../../components/modal/import';
import { useApi, useMutation } from '@/hooks/use-api';
import { endpoints } from '@/api/endpoints';
import type { IPostListItem, IPostStats, IPagination, PostStatus } from '@/api/types';
import dayjs from 'dayjs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hueFromId(id: string): number {
  return parseInt(id.slice(-6), 16) % 360;
}

function formatDelta(current: number, prev: number): string {
  const diff = current - prev;
  if (diff === 0) return 'Same as prev 30d';
  return `${diff > 0 ? '+' : ''}${diff} vs prev 30d`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = PostStatus | 'all';

export default function PostsPage() {
  const [tab, setTab]             = useState<Tab>('all');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const { data: postsRes, isLoading: postsLoading } = useApi<IPagination<IPostListItem>>(
    endpoints.posts,
    { pathParams: tab === 'all' ? { page } : { page, status: tab } }
  );

  const { data: statsRes } = useApi<IPostStats>(endpoints.postStats);

  const { trigger: deletePosts } = useMutation(endpoints.posts, {
    method: 'DELETE',
    invalidate: [endpoints.posts, endpoints.postStats],
  });

  const posts      = postsRes?.data?.docs      ?? [];
  const total      = postsRes?.data?.totalDocs ?? 0;
  const totalPages = postsRes?.data?.totalPages ?? 1;
  const stats      = statsRes?.data;

  // ── Tabs ─────────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'published', label: 'Published' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'review',    label: 'In review' },
    { id: 'draft',     label: 'Drafts' },
  ];

  function tabCount(t: Tab): number {
    if (!stats) return 0;
    if (t === 'all')       return stats.total_count;
    if (t === 'draft')     return stats.draft_count;
    if (t === 'review')    return stats.review_count;
    if (t === 'scheduled') return stats.scheduled_count;
    if (t === 'published') return stats.published_30d;
    return 0;
  }

  function changeTab(t: Tab) {
    setTab(t);
    setPage(1);
    setSelected(new Set());
  }

  // ── Selection ────────────────────────────────────────────────────────────────

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p._id)));
    }
  };

  // ── Stat cards ───────────────────────────────────────────────────────────────

  const nextSched = stats?.next_scheduled_at
    ? dayjs(stats.next_scheduled_at).format('MMM D HH:mm')
    : '—';

  const statCards = [
    {
      k: 'Drafts',
      v: stats?.draft_count ?? '—',
      d: '+2 this week',
      color: 'text-stone-700',
    },
    {
      k: 'In review',
      v: stats?.review_count ?? '—',
      d: '1 needs sign-off',
      color: 'text-amber-700',
    },
    {
      k: 'Scheduled',
      v: stats?.scheduled_count ?? '—',
      d: `Next: ${nextSched}`,
      color: 'text-violet-700',
    },
    {
      k: 'Published 30d',
      v: stats?.published_30d ?? '—',
      d: stats ? formatDelta(stats.published_30d, stats.published_prev_30d) : '—',
      color: 'text-emerald-700',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-stone-50 min-h-0 overflow-hidden">
      <DashTopBar breadcrumbs={['Posts']} />

      <div className="px-8 pt-7 pb-5">
        {/* Page header */}
        <div className="flex items-end justify-between gap-6 mb-1">
          <div>
            <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 leading-tight m-0">
              Posts
            </h1>
            <p className="text-[13px] text-stone-500 mt-1">
              Write, schedule, and ship posts to the Puplar blog.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowImport(true)}>
              <Ic.Upload className="w-3.5 h-3.5" /> Import
            </Button>
            <Link
              to="/posts/new"
              className="text-[13px] font-semibold text-white bg-puplar-700 hover:bg-puplar-900 rounded-md px-3.5 py-1.5 inline-flex items-center gap-1.5 transition"
            >
              <Ic.Plus className="w-3.5 h-3.5" /> New post
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {statCards.map((s) => (
            <div key={s.k} className="bg-white border border-stone-200 rounded-lg px-4 py-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-stone-500">{s.k}</div>
              <div className={`font-display text-[28px] font-bold tracking-[-0.025em] mt-0.5 leading-none ${s.color}`}>
                {s.v}
              </div>
              <div className="text-[12px] text-stone-500 mt-1.5">{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-8 flex-1 flex flex-col min-h-0 pb-8">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Tabs + controls */}
          <div className="flex items-center justify-between border-b border-stone-200 px-4 pt-2.5 shrink-0">
            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTab(t.id)}
                  className={`text-[13px] px-3 py-2 -mb-px border-b-2 transition ${tab === t.id
                    ? 'border-puplar-700 text-stone-900 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {t.label}{' '}
                  <span className="ml-1 text-[11px] text-stone-400 font-normal">{tabCount(t.id)}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 pb-2">
              <Button variant="secondary" size="sm">
                <Ic.Filter className="w-3.5 h-3.5" /> Filter
              </Button>
              <Button variant="secondary" size="sm">
                <Ic.Sort className="w-3.5 h-3.5" /> Sort: Recent
              </Button>
              <Button variant="secondary" size="sm" className="px-2">
                <Ic.More className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="bg-puplar-700 text-white px-4 py-2 flex items-center justify-between text-[13px] shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{selected.size} selected</span>
                <button className="text-white/85 hover:text-white transition">Move to…</button>
                <span className="opacity-30">·</span>
                <button className="text-white/85 hover:text-white transition">Add tags</button>
                <span className="opacity-30">·</span>
                <button className="text-white/85 hover:text-white transition">Schedule</button>
                <span className="opacity-30">·</span>
                <button
                  onClick={() => void deletePosts(undefined)}
                  className="text-rose-200 hover:text-rose-100 transition"
                >
                  Delete
                </button>
              </div>
              <button onClick={() => setSelected(new Set())} className="text-white/70 hover:text-white transition">
                <Ic.X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {postsLoading ? (
              <div className="py-16 text-center text-[13px] text-stone-400">Loading…</div>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="bg-stone-50/70 border-b border-stone-200 sticky top-0">
                  <tr className="text-left text-[11px] font-mono uppercase tracking-[0.08em] text-stone-500">
                    <th className="px-4 py-2.5 w-8">
                      <input
                        type="checkbox"
                        className="accent-puplar-700"
                        checked={selected.size === posts.length && posts.length > 0}
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="px-2 py-2.5">Title</th>
                    <th className="px-2 py-2.5 w-[110px]">Status</th>
                    <th className="px-2 py-2.5 w-[120px]">Category</th>
                    <th className="px-2 py-2.5 w-[80px] text-right">Words</th>
                    <th className="px-2 py-2.5 w-[80px] text-right">Views</th>
                    <th className="px-2 py-2.5 w-[160px]">Last edited</th>
                    <th className="px-2 py-2.5 w-[140px]">Schedule / pub</th>
                    <th className="px-2 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => {
                    const isSel     = selected.has(p._id);
                    const lastEdit  = p.edit_history[p.edit_history.length - 1];
                    return (
                      <tr
                        key={p._id}
                        className={`border-b border-stone-100 hover:bg-stone-50/70 transition ${isSel ? 'bg-puplar-700/[0.04]' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggle(p._id)}
                            className="accent-puplar-700"
                          />
                        </td>
                        <td className="px-2 py-3 max-w-[420px]">
                          <div className="flex items-start gap-2.5">
                            {p.featured_image?.url ? (
                              <img
                                src={p.featured_image.url}
                                alt={p.title}
                                className="w-9 h-9 rounded object-cover shrink-0"
                              />
                            ) : (
                              <Thumb hue={hueFromId(p._id)} w={36} h={36} className="rounded shrink-0" />
                            )}
                            <div className="min-w-0">
                              <Link
                                to={`/posts/${p._id}`}
                                className="font-semibold text-stone-900 truncate text-[13.5px] hover:text-puplar-700 transition block"
                              >
                                {p.title}
                              </Link>
                              <div className="flex gap-1.5 mt-1 flex-wrap">
                                {p.tags.slice(0, 3).map((t) => (
                                  <span key={t} className="text-[11px] text-stone-500 bg-stone-100 rounded px-1.5 py-0.5">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <StatusPill status={p.status} size="sm" />
                        </td>
                        <td className="px-2 py-3 text-stone-700">{p.category?.name ?? '—'}</td>
                        <td className="px-2 py-3 text-right font-mono text-stone-600">
                          {p.word_count.toLocaleString()}
                        </td>
                        <td className="px-2 py-3 text-right font-mono text-stone-600">{p.view_count}</td>
                        <td className="px-2 py-3">
                          {lastEdit ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar name={lastEdit.name} size={18} />
                              <span className="text-stone-700 text-[12.5px]">{lastEdit.name}</span>
                              <span className="text-stone-400 text-[12px]">
                                · {dayjs(lastEdit.at).format('MMM D')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-stone-400 text-[12px]">—</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-stone-600 text-[12.5px]">
                          {p.scheduled_at ? (
                            <span className="text-violet-700">
                              {dayjs(p.scheduled_at).format('MMM D HH:mm')}
                            </span>
                          ) : p.published_at ? (
                            dayjs(p.published_at).format('MMM D, YYYY')
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-2 py-3 text-stone-400">
                          <button className="hover:text-stone-700 p-1 transition">
                            <Ic.More className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination footer */}
          <div className="border-t border-stone-200 px-4 py-2.5 flex items-center justify-between text-[12px] text-stone-500 shrink-0">
            <span>
              Showing <span className="text-stone-900 font-semibold">{posts.length}</span> of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 border border-stone-200 rounded hover:bg-stone-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button className="px-2 py-1 border border-stone-200 rounded bg-stone-100 font-semibold text-stone-900">
                {page}
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 border border-stone-200 rounded hover:bg-stone-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
