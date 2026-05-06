import { useState } from 'react';
import { Ic } from '../../components/icons';
import { Button, IconButton } from '../../components/material';
import { useMutation } from '@/hooks/use-api';
import { endpoints } from '@/api/endpoints';
import type { ICategory, CreateCategoryPayload, UpdateCategoryPayload } from '@/api/types';

const COLOR_SWATCHES = [
  '#10b981', '#06b6d4', '#005a6e', '#6366f1',
  '#f59e0b', '#f43f5e', '#78716c', '#8b5cf6',
];

export interface CategoryFormModalProps {
  initial?: ICategory;
  onClose: () => void;
}

export function CategoryFormModal({ initial, onClose }: CategoryFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? COLOR_SWATCHES[0]);
  const isEdit = !!initial;
  const slug = isEdit
    ? initial.slug
    : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');
  const canSubmit = name.trim().length > 0;

  const { trigger: createCat, isLoading: creating } = useMutation<ICategory, CreateCategoryPayload>(
    endpoints.categories,
    { invalidate: [endpoints.categories] }
  );

  const { trigger: updateCat, isLoading: updating } = useMutation<ICategory, UpdateCategoryPayload>(
    endpoints.categoryDetails,
    { method: 'PUT', invalidate: [endpoints.categories] }
  );

  const saving = creating || updating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const data = { name: name.trim(), color };
    if (isEdit) {
      await updateCat(data, { slug: initial.slug });
    } else {
      await createCat(data);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="text-[14px] font-semibold text-stone-900">
            {isEdit ? 'Edit category' : 'New category'}
          </div>
          <IconButton onClick={onClose}><Ic.X className="w-4 h-4" /></IconButton>
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
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit} loading={saving}>
              {isEdit ? 'Save changes' : 'Create category'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
