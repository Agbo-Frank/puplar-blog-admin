import { useState } from 'react';
import { DashTopBar } from '../../components/layout/top-bar';
import { Ic } from '../../components/icons';
import { Button, IconButton } from '../../components/material';
import { useApi, useCategories, useMutation } from '@/hooks/use-api';
import { endpoints } from '@/api/endpoints';
import type { ICategory, ITag } from '@/api/types';
import { CategoryFormModal } from './category-form-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import { RowMenu } from './row-menu';

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TaxonomyPage() {
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingCat, setEditingCat] = useState<ICategory | null>(null);
  const [deletingCat, setDeletingCat] = useState<ICategory | null>(null);
  const [openMenu, setOpenMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const [tagEditMode, setTagEditMode] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const { categories, isLoading: catsLoading } = useCategories();
  const { data: tagRes, isLoading: tagsLoading } = useApi<ITag[]>(endpoints.tags);

  const tags = tagRes?.data ?? [];

  // ── Tag mutations ────────────────────────────────────────────────────────────

  const { trigger: createTag, isLoading: creatingTag } = useMutation<ITag, { slug: string }>(
    endpoints.tags,
    { invalidate: [endpoints.tags] }
  );

  const { trigger: deleteTag } = useMutation(
    endpoints.tagDetails,
    { method: 'DELETE', invalidate: [endpoints.tags] }
  );

  async function commitTag() {
    const slug = newTag.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (slug) await createTag({ slug });
    setNewTag('');
    setShowTagInput(false);
  }

  async function removeTag(slug: string) {
    await deleteTag(undefined, { slug });
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DashTopBar title="Categories & Tags" />

      <div className="flex-1 bg-stone-50 overflow-y-auto">
        <div className="px-8 pt-7 pb-8">

          {/* ── Categories ── */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 m-0">
                Categories
              </h1>
              <p className="text-[13px] text-stone-500 mt-1">Top-level sections of the blog.</p>
            </div>
            <Button onClick={() => setShowAddCat(true)}>
              <Ic.Plus className="w-3.5 h-3.5" /> New category
            </Button>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            {catsLoading && (
              <div className="px-4 py-8 text-center text-[13px] text-stone-400">Loading…</div>
            )}
            {!catsLoading && categories.length === 0 && (
              <div className="px-4 py-8 text-center text-[13px] text-stone-400">No categories yet.</div>
            )}
            {categories?.map((c, i) => (
              <div
                key={c._id}
                className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-stone-100' : ''} hover:bg-stone-50/70 transition`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-stone-900">{c.name}</div>
                  <div className="text-[11.5px] text-stone-500 font-mono">/blog/{c.slug}</div>
                </div>
                <span className="text-[12px] text-stone-500">{c.post_count} posts</span>
                <div>
                  <button
                    onClick={(e) => setOpenMenu(openMenu?.id === c._id ? null : { id: c._id, anchor: e.currentTarget })}
                    className={`text-stone-400 hover:text-stone-700 transition rounded p-0.5 ${openMenu?.id === c._id ? 'bg-stone-100 text-stone-700' : ''}`}
                  >
                    <Ic.More className="w-4 h-4" />
                  </button>
                  {openMenu?.id === c._id && (
                    <RowMenu
                      anchor={openMenu.anchor}
                      category={c}
                      onEdit={() => setEditingCat(c)}
                      onDelete={() => setDeletingCat(c)}
                      onClose={() => setOpenMenu(null)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Tags ── */}
          <div className="mt-8 flex items-end justify-between mb-3">
            <h2 className="font-display font-bold text-[18px] tracking-[-0.015em] text-stone-900 m-0">Tags</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setTagEditMode((m) => !m); setShowTagInput(false); setNewTag(''); }}
            >
              {tagEditMode ? 'Done' : 'Edit tags'}
            </Button>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-wrap gap-1.5">
            {tagsLoading && (
              <span className="text-[13px] text-stone-400">Loading…</span>
            )}
            {tags.map((t) => {
              const size = 0.7 + (t.slug.length % 5) * 0.06;
              return (
                <span
                  key={t._id}
                  className="inline-flex items-center gap-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full px-2.5 py-1 transition"
                  style={{ fontSize: `${11 + size * 4}px` }}
                >
                  #{t.slug}
                  <span className="ml-0.5 text-stone-400 font-mono text-[10px]">
                    {t.post_count}
                  </span>
                  {tagEditMode && (
                    <IconButton
                      destructive
                      onClick={() => removeTag(t.slug)}
                      title={`Remove #${t.slug}`}
                      className="ml-0.5"
                    >
                      <Ic.X className="w-2.5 h-2.5" />
                    </IconButton>
                  )}
                </span>
              );
            })}

            {tagEditMode && (
              showTagInput ? (
                <input
                  autoFocus
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); void commitTag(); }
                    if (e.key === 'Escape') { setNewTag(''); setShowTagInput(false); }
                  }}
                  onBlur={() => void commitTag()}
                  placeholder="new-tag"
                  disabled={creatingTag}
                  className="text-[12px] font-mono border border-stone-300 rounded-full px-2.5 py-1 outline-none w-24 focus:border-puplar-700 bg-white disabled:opacity-50"
                />
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="inline-flex items-center gap-1 text-[12px] text-stone-500 border border-dashed border-stone-300 rounded-full px-2.5 py-1 hover:bg-stone-50 transition"
                >
                  <Ic.Plus className="w-3 h-3" /> Add tag
                </button>
              )
            )}
          </div>

        </div>
      </div>

      {/* Modals */}
      {showAddCat && (
        <CategoryFormModal onClose={() => setShowAddCat(false)} />
      )}
      {editingCat && (
        <CategoryFormModal
          initial={editingCat}
          onClose={() => setEditingCat(null)}
        />
      )}
      {deletingCat && (
        <DeleteConfirmModal
          category={deletingCat}
          onClose={() => setDeletingCat(null)}
        />
      )}
    </div>
  );
}
