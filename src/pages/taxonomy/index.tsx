import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DashTopBar } from '../../components/layout/top-bar';
import { Ic } from '../../components/icons';
import { DASH_CATEGORIES, DASH_TAGS } from '../../data/admin';
import type { AdminCategory } from '../../types/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_SWATCHES = [
  '#10b981', '#06b6d4', '#005a6e', '#6366f1',
  '#f59e0b', '#f43f5e', '#78716c', '#8b5cf6',
];

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');
}

// ─── Category form (shared by Add + Edit) ─────────────────────────────────────

interface CategoryFormModalProps {
  initial?: AdminCategory;
  onSave: (c: AdminCategory) => void;
  onClose: () => void;
}

function CategoryFormModal({ initial, onSave, onClose }: CategoryFormModalProps) {
  const [name,  setName]  = useState(initial?.name  ?? '');
  const [color, setColor] = useState(initial?.color ?? COLOR_SWATCHES[0]);
  const isEdit    = !!initial;
  const slug      = isEdit ? initial.id : (slugify(name) || '');
  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSave({
      id:    isEdit ? initial.id : (slug || `cat-${Date.now()}`),
      name:  name.trim(),
      color,
      count: initial?.count ?? 0,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="text-[14px] font-semibold text-stone-900">
            {isEdit ? 'Edit category' : 'New category'}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition">
            <Ic.X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-stone-500">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering"
              className="text-[13.5px] border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-puplar-700 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-stone-500">URL slug</label>
            <div className="text-[12px] font-mono text-stone-500 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
              /blog/{slug || <span className="text-stone-300">slug-will-appear-here</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] text-stone-500">Colour</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_SWATCHES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setColor(s)}
                  className={`w-6 h-6 rounded-full transition ${color === s ? 'ring-2 ring-offset-2 ring-stone-400' : 'hover:scale-110'}`}
                  style={{ background: s }}
                />
              ))}
              <label className="relative w-6 h-6 rounded-full overflow-hidden border border-stone-200 cursor-pointer hover:scale-110 transition" title="Custom colour">
                <span className="text-[8px] text-stone-400 flex items-center justify-center h-full">+</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[12.5px] text-stone-700">{name || 'Category name'}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-[13px] text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="text-[13px] font-semibold text-white bg-puplar-700 rounded-lg px-4 py-1.5 hover:bg-puplar-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEdit ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ─── Delete confirmation modal ─────────────────────────────────────────────────

interface DeleteConfirmProps {
  category: AdminCategory;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteConfirmModal({ category, onConfirm, onClose }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl shadow-2xl w-[360px] p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
            <Ic.X className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-stone-900">Delete "{category.name}"?</div>
            <div className="text-[13px] text-stone-500 mt-1 leading-relaxed">
              This will remove the category. Posts currently assigned to it will become uncategorised.
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-[13px] text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="text-[13px] font-semibold text-white bg-red-500 rounded-lg px-4 py-1.5 hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row context menu ──────────────────────────────────────────────────────────

interface RowMenuProps {
  category: AdminCategory;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function RowMenu({ category, onEdit, onDelete, onClose }: RowMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-30 bg-white border border-stone-200 rounded-lg shadow-lg py-1 w-44"
    >
      <button
        onClick={() => { onEdit(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-stone-700 hover:bg-stone-50 transition text-left"
      >
        <Ic.Settings className="w-3.5 h-3.5 text-stone-400" />
        Edit category
      </button>
      <Link
        to="/posts"
        onClick={onClose}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-stone-700 hover:bg-stone-50 transition"
      >
        <Ic.Doc className="w-3.5 h-3.5 text-stone-400" />
        View posts
        <span className="ml-auto text-[11px] font-mono text-stone-400">{category.count}</span>
      </Link>
      <div className="my-1 border-t border-stone-100" />
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition text-left"
      >
        <Ic.X className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TaxonomyPage() {
  const [categories,   setCategories]   = useState<AdminCategory[]>(DASH_CATEGORIES);
  const [tags,         setTags]         = useState<string[]>(DASH_TAGS);
  const [showAddCat,   setShowAddCat]   = useState(false);
  const [editingCat,   setEditingCat]   = useState<AdminCategory | null>(null);
  const [deletingCat,  setDeletingCat]  = useState<AdminCategory | null>(null);
  const [openMenuId,   setOpenMenuId]   = useState<string | null>(null);
  const [tagEditMode,  setTagEditMode]  = useState(false);
  const [newTag,       setNewTag]       = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  function saveCategory(c: AdminCategory) {
    setCategories((prev) =>
      prev.some((x) => x.id === c.id)
        ? prev.map((x) => (x.id === c.id ? c : x))
        : [...prev, c],
    );
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  function commitTag() {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setNewTag('');
    setShowTagInput(false);
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
            <button
              onClick={() => setShowAddCat(true)}
              className="text-[13px] font-semibold text-white bg-puplar-700 hover:bg-puplar-900 rounded-md px-3 py-1.5 inline-flex items-center gap-1.5 transition"
            >
              <Ic.Plus className="w-3.5 h-3.5" /> New category
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            {categories.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-stone-100' : ''} hover:bg-stone-50/70 transition`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-stone-900">{c.name}</div>
                  <div className="text-[11.5px] text-stone-500 font-mono">/blog/{c.id}</div>
                </div>
                <span className="text-[12px] text-stone-500">{c.count} posts</span>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    className={`text-stone-400 hover:text-stone-700 transition rounded p-0.5 ${openMenuId === c.id ? 'bg-stone-100 text-stone-700' : ''}`}
                  >
                    <Ic.More className="w-4 h-4" />
                  </button>
                  {openMenuId === c.id && (
                    <RowMenu
                      category={c}
                      onEdit={() => setEditingCat(c)}
                      onDelete={() => setDeletingCat(c)}
                      onClose={() => setOpenMenuId(null)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Tags ── */}
          <div className="mt-8 flex items-end justify-between mb-3">
            <h2 className="font-display font-bold text-[18px] tracking-[-0.015em] text-stone-900 m-0">Tags</h2>
            <button
              onClick={() => { setTagEditMode((m) => !m); setShowTagInput(false); setNewTag(''); }}
              className="text-[12px] text-stone-700 border border-stone-200 bg-white rounded-md px-2.5 py-1 hover:bg-stone-50 transition"
            >
              {tagEditMode ? 'Done' : 'Edit tags'}
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const size = 0.7 + (t.length % 5) * 0.06;
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full px-2.5 py-1 transition"
                  style={{ fontSize: `${11 + size * 4}px` }}
                >
                  #{t}
                  <span className="ml-0.5 text-stone-400 font-mono text-[10px]">
                    {Math.floor(2 + (t.charCodeAt(0) % 13))}
                  </span>
                  {tagEditMode && (
                    <button
                      onClick={() => removeTag(t)}
                      className="ml-0.5 text-stone-400 hover:text-red-500 transition"
                      title={`Remove #${t}`}
                    >
                      <Ic.X className="w-2.5 h-2.5" />
                    </button>
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
                    if (e.key === 'Enter')  { e.preventDefault(); commitTag(); }
                    if (e.key === 'Escape') { setNewTag(''); setShowTagInput(false); }
                  }}
                  onBlur={commitTag}
                  placeholder="new-tag"
                  className="text-[12px] font-mono border border-stone-300 rounded-full px-2.5 py-1 outline-none w-24 focus:border-puplar-700 bg-white"
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
        <CategoryFormModal
          onSave={saveCategory}
          onClose={() => setShowAddCat(false)}
        />
      )}
      {editingCat && (
        <CategoryFormModal
          initial={editingCat}
          onSave={saveCategory}
          onClose={() => setEditingCat(null)}
        />
      )}
      {deletingCat && (
        <DeleteConfirmModal
          category={deletingCat}
          onConfirm={() => deleteCategory(deletingCat.id)}
          onClose={() => setDeletingCat(null)}
        />
      )}
    </div>
  );
}
