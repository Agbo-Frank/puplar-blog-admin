import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Ic } from '../../../components/icons';
import { Avatar, StatusPill } from '../../../components/material';
import { MediaPickerModal } from '../../../components/modal/media-picker';
import { useCategories } from '@/hooks/use-api';
import type { PostStatus, IEditHistoryEntry, IMedia } from '@/api/types';
import dayjs from 'dayjs';
import { isEmpty } from '@/utils';

interface SectionProps { title: string; children: ReactNode; }
function Section({ title, children }: SectionProps) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-2.5">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

interface FieldProps { label: string; children: ReactNode; col?: boolean; }
function Field({ label, children, col }: FieldProps) {
  return (
    <div className={col ? 'flex flex-col gap-1' : 'flex items-center justify-between gap-2'}>
      <span className="text-[12px] text-stone-500">{label}</span>
      {children}
    </div>
  );
}

interface DashEditorRailProps {
  status: PostStatus;
  category: string;   // category _id
  tags: string[];
  slug: string;
  publishedAt: string | null;
  scheduledAt: string;
  history: IEditHistoryEntry[];
  featuredImage: Pick<IMedia, '_id' | 'url' | 'name'> | null;
  onStatusChange: (s: PostStatus) => void;
  onCategoryChange: (id: string) => void;
  onTagsChange: (t: string[]) => void;
  onSlugChange: (s: string) => void;
  onScheduledAtChange: (d: string) => void;
  onFeaturedImageChange: (media: Pick<IMedia, '_id' | 'url' | 'name'> | null) => void;
}

export function DashEditorRail({
  status, category, tags, slug, publishedAt, scheduledAt, history, featuredImage,
  onStatusChange, onCategoryChange, onTagsChange, onSlugChange, onScheduledAtChange, onFeaturedImageChange,
}: DashEditorRailProps) {
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showCoverPick, setShowCoverPick] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const { categories } = useCategories();

  // Close status dropdown on outside click
  useEffect(() => {
    if (!showStatusDrop) return;
    function handle(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusDrop(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showStatusDrop]);

  function commitTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) onTagsChange([...tags, t]);
    setTagInput('');
    setShowTagInput(false);
  }

  return (
    <>
      <aside className="w-[300px] border-l border-stone-200 bg-stone-50/60 overflow-y-auto shrink-0">
        <div className="flex flex-col gap-6">

          {/* ── Cover Image ── */}
          {featuredImage ? (
            <div className="relative group">
              <img
                src={featuredImage.url}
                alt={featuredImage.name}
                className="w-full h-[160px] object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-end justify-end p-2 gap-1.5 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setShowCoverPick(true)}
                  className="text-[11px] font-medium text-white bg-black/50 backdrop-blur-sm rounded px-2 py-1 hover:bg-black/70 transition"
                >
                  Change
                </button>
                <button
                  onClick={() => onFeaturedImageChange(null)}
                  className="text-[11px] font-medium text-white bg-red-600/80 backdrop-blur-sm rounded px-2 py-1 hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCoverPick(true)}
              className="w-full h-[100px] border-b border-dashed border-stone-200 flex items-center justify-center gap-2 text-[12.5px] text-stone-400 hover:bg-stone-100/60 hover:text-stone-600 transition"
            >
              <Ic.Upload className="w-3.5 h-3.5" /> Add cover image
            </button>
          )}

          <div className="px-5 flex flex-col gap-6 pb-5">

            {/* ── Publish ── */}
            <Section title="Publish">
              <Field label="Status">
                <div ref={statusRef} className="relative">
                  <button onClick={() => setShowStatusDrop((d) => !d)}>
                    <StatusPill status={status} size="sm" />
                  </button>
                  {showStatusDrop && (
                    <div className="absolute z-20 top-full right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-md py-1 min-w-[150px]">
                      {(['draft', 'review', 'scheduled', 'published'] as PostStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => { onStatusChange(s); setShowStatusDrop(false); }}
                          className="w-full px-3 py-1.5 text-left hover:bg-stone-50 transition"
                        >
                          <StatusPill status={s} size="sm" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Visibility">
                <span className="text-[12.5px] text-stone-700">Public</span>
              </Field>
              <Field label="Schedule">
                {scheduledAt ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => onScheduledAtChange(e.target.value)}
                      className="text-[12px] border border-stone-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-puplar-700 transition"
                    />
                    <button
                      onClick={() => onScheduledAtChange('')}
                      className="text-stone-400 hover:text-stone-700 transition shrink-0"
                      title="Clear schedule"
                    >
                      <Ic.X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const now = new Date();
                      now.setDate(now.getDate() + 1);
                      now.setMinutes(0, 0, 0);
                      onScheduledAtChange(now.toISOString().slice(0, 16));
                    }}
                    className="text-[12.5px] text-violet-700 inline-flex items-center gap-1 hover:text-violet-900 transition"
                  >
                    <Ic.Calendar className="w-3 h-3" /> Set date…
                  </button>
                )}
              </Field>
            </Section>

            {/* ── Organize ── */}
            <Section title="Organize">
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="text-[12.5px] border border-stone-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-puplar-700 transition"
                >
                  <option value="">Select…</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tags" col>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-[11px] bg-white border border-stone-200 rounded-full px-2 py-0.5 text-stone-700">
                      #{t}
                      <button
                        onClick={() => onTagsChange(tags.filter((x) => x !== t))}
                        className="text-stone-400 hover:text-stone-700 transition"
                      >
                        <Ic.X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {showTagInput ? (
                    <input
                      autoFocus
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); commitTag(); }
                        if (e.key === 'Escape') { setTagInput(''); setShowTagInput(false); }
                      }}
                      onBlur={commitTag}
                      placeholder="tag name"
                      className="text-[11px] border border-stone-300 rounded-full px-2 py-0.5 outline-none w-20 focus:border-puplar-700"
                    />
                  ) : (
                    <button
                      onClick={() => setShowTagInput(true)}
                      className="text-[11px] text-stone-500 border border-dashed border-stone-300 rounded-full px-2 py-0.5 hover:bg-white transition"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </Field>
            </Section>

            <Field label="Slug" col>
              <input
                value={slug}
                onChange={(e) => {
                  const formatted = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/-{2,}/g, '-');
                  onSlugChange(formatted);
                }}
                disabled={!isEmpty(publishedAt)}
                className="text-[12px] font-mono border border-stone-200 rounded px-2 py-1 bg-white w-full focus:outline-none focus:border-puplar-700 transition"
              />
            </Field>

            {/* ── History ── */}
            {history?.length > 0 && (
              <Section title="History">
                {history.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <Avatar name={h.name} size={18} />
                    <span className="text-stone-700 font-medium">{h.name}</span>
                    <span className="text-stone-500 truncate">{h.action}</span>
                    <span className="text-stone-400 ml-auto shrink-0">{dayjs(h.at).format('MMM D')}</span>
                  </div>
                ))}
              </Section>
            )}

          </div>
        </div>
      </aside>

      {showCoverPick && (
        <MediaPickerModal
          onClose={() => setShowCoverPick(false)}
          onSelect={(media) => {
            onFeaturedImageChange(media);
            setShowCoverPick(false);
          }}
        />
      )}
    </>
  );
}
