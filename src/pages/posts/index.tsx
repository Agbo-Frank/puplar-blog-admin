import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashTopBar } from '../../components/layout/top-bar';
import { Ic } from '../../components/icons';
import { StatusPill, Avatar, Thumb } from '../../components/material';
import { ImportModal } from '../../components/material/ImportModal';
import { DASH_POSTS } from '../../data/admin';
import type { PostStatus } from '../../types/admin';

type Tab = PostStatus | 'all';

export default function PostsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'published', label: 'Published' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'review', label: 'In review' },
    { id: 'draft', label: 'Drafts' },
  ];

  const visible = tab === 'all' ? DASH_POSTS : DASH_POSTS.filter((p) => p.status === tab);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === visible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((p) => p.id)));
    }
  };

  const statCards = [
    {
      k: 'Drafts',
      v: DASH_POSTS.filter((p) => p.status === 'draft').length,
      d: '+2 this week',
      color: 'text-stone-700',
    },
    {
      k: 'In review',
      v: DASH_POSTS.filter((p) => p.status === 'review').length,
      d: '1 needs sign-off',
      color: 'text-amber-700',
    },
    {
      k: 'Scheduled',
      v: DASH_POSTS.filter((p) => p.status === 'scheduled').length,
      d: 'Next: Apr 30 14:00',
      color: 'text-violet-700',
    },
    {
      k: 'Published 30d',
      v: DASH_POSTS.filter((p) => p.status === 'published').length,
      d: '+3 vs prev 30d',
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
            <button
              onClick={() => setShowImport(true)}
              className="text-[13px] text-stone-700 border border-stone-200 bg-white rounded-md px-3 py-1.5 inline-flex items-center gap-1.5 hover:bg-stone-50 transition"
            >
              <Ic.Upload className="w-3.5 h-3.5" /> Import
            </button>
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
              {tabs.map((t) => {
                const count = t.id === 'all' ? DASH_POSTS.length : DASH_POSTS.filter((p) => p.status === t.id).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`text-[13px] px-3 py-2 -mb-px border-b-2 transition ${tab === t.id
                      ? 'border-puplar-700 text-stone-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                      }`}
                  >
                    {t.label}{' '}
                    <span className="ml-1 text-[11px] text-stone-400 font-normal">{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 pb-2">
              <button className="text-[12px] text-stone-600 border border-stone-200 rounded-md px-2.5 py-1 inline-flex items-center gap-1.5 hover:bg-stone-50 transition">
                <Ic.Filter className="w-3.5 h-3.5" /> Filter
              </button>
              <button className="text-[12px] text-stone-600 border border-stone-200 rounded-md px-2.5 py-1 inline-flex items-center gap-1.5 hover:bg-stone-50 transition">
                <Ic.Sort className="w-3.5 h-3.5" /> Sort: Recent
              </button>
              <button className="text-[12px] text-stone-600 border border-stone-200 rounded-md px-2 py-1 hover:bg-stone-50 transition">
                <Ic.More className="w-3.5 h-3.5" />
              </button>
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
                <button className="text-rose-200 hover:text-rose-100 transition">Delete</button>
              </div>
              <button onClick={() => setSelected(new Set())} className="text-white/70 hover:text-white transition">
                <Ic.X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-stone-50/70 border-b border-stone-200 sticky top-0">
                <tr className="text-left text-[11px] font-mono uppercase tracking-[0.08em] text-stone-500">
                  <th className="px-4 py-2.5 w-8">
                    <input
                      type="checkbox"
                      className="accent-puplar-700"
                      checked={selected.size === visible.length && visible.length > 0}
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
                {visible.map((p) => {
                  const isSel = selected.has(p.id);
                  const hue = (p.id.charCodeAt(1) * 50) % 360;
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-stone-100 hover:bg-stone-50/70 transition ${isSel ? 'bg-puplar-700/[0.04]' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggle(p.id)}
                          className="accent-puplar-700"
                        />
                      </td>
                      <td className="px-2 py-3 max-w-[420px]">
                        <div className="flex items-start gap-2.5">
                          <Thumb hue={hue} w={36} h={36} className="rounded shrink-0" />
                          <div className="min-w-0">
                            <Link
                              to={`/posts/${p.id}`}
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
                      <td className="px-2 py-3 text-stone-700">{p.cat}</td>
                      <td className="px-2 py-3 text-right font-mono text-stone-600">
                        {p.words.toLocaleString()}
                      </td>
                      <td className="px-2 py-3 text-right font-mono text-stone-600">{p.views}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={p.editedBy} size={18} />
                          <span className="text-stone-700 text-[12.5px]">{p.editedBy}</span>
                          <span className="text-stone-400 text-[12px]">· {p.editedAt}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-stone-600 text-[12.5px]">
                        {p.scheduled ? (
                          <span className="text-violet-700">{p.scheduled}</span>
                        ) : (
                          p.publishedAt
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
          </div>

          {/* Pagination footer */}
          <div className="border-t border-stone-200 px-4 py-2.5 flex items-center justify-between text-[12px] text-stone-500 shrink-0">
            <span>
              Showing <span className="text-stone-900 font-semibold">{visible.length}</span> of {DASH_POSTS.length}
            </span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-stone-200 rounded hover:bg-stone-50 transition">Prev</button>
              <button className="px-2 py-1 border border-stone-200 rounded bg-stone-100 font-semibold text-stone-900">
                1
              </button>
              <button className="px-2 py-1 border border-stone-200 rounded hover:bg-stone-50 transition">Next</button>
            </div>
          </div>
        </div>
      </div>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
