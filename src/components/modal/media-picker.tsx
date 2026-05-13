import { useState, useRef } from 'react';
import { Ic } from '../icons';
import { useApi } from '@/hooks/use-api';
import { endpoints } from '@/api/endpoints';
import { post } from '@/api/fetcher';
import type { IMedia, IPagination } from '@/api/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeToLabel(type: string): string {
  if (type === 'image/jpeg') return 'JPG';
  if (type === 'image/png')  return 'PNG';
  if (type === 'image/svg+xml') return 'SVG';
  if (type === 'image/gif')  return 'GIF';
  if (type === 'image/webp') return 'WEBP';
  if (type === 'video/mp4')  return 'MP4';
  return type.split('/').pop()?.toUpperCase() ?? 'FILE';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaPickerModalProps {
  onSelect: (media: Pick<IMedia, '_id' | 'url' | 'name'>) => void;
  onClose:  () => void;
}

type Tab = 'library' | 'upload';

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaPickerModal({ onSelect, onClose }: MediaPickerModalProps) {
  const [tab,      setTab]      = useState<Tab>('library');
  const [query,    setQuery]    = useState('');
  const [hoverId,  setHoverId]  = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Library from API ──────────────────────────────────────────────────────

  const { data: mediaRes, isLoading, mutate } = useApi<IPagination<IMedia>>(endpoints.media);
  const allMedia = mediaRes?.data?.docs ?? [];
  const filtered = allMedia.filter((m) =>
    !query || m.name.toLowerCase().includes(query.toLowerCase())
  );

  // ── Upload ────────────────────────────────────────────────────────────────

  async function processFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/') && file.type !== 'video/mp4') continue;
        const formData = new FormData();
        formData.append('file', file);
        await post<IMedia, FormData>(endpoints.media, formData);
      }
      await mutate();
      setTab('library');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    void processFiles(e.dataTransfer.files);
  }

  // ── Select ────────────────────────────────────────────────────────────────

  function handleSelect(item: IMedia) {
    onSelect({ _id: item._id, url: item.url, name: item.name });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl shadow-2xl w-[640px] max-h-[560px] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <div className="text-[14px] font-semibold text-stone-900">Media library</div>
            <div className="text-[12px] text-stone-500">
              {allMedia.length} asset{allMedia.length !== 1 ? 's' : ''} · click to insert
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition">
            <Ic.X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 px-5">
          {(['library', 'upload'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[13px] font-medium py-2.5 mr-5 border-b-2 transition capitalize ${
                tab === t
                  ? 'border-puplar-700 text-puplar-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              {t === 'upload' ? 'Upload new' : 'Library'}
            </button>
          ))}
        </div>

        {/* ── Library tab ── */}
        {tab === 'library' && (
          <>
            <div className="px-5 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-1.5">
                <Ic.Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search media…"
                  className="text-[13px] flex-1 outline-none bg-transparent placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="text-center py-10 text-[13px] text-stone-400">Loading…</div>
              )}
              {!isLoading && filtered.length === 0 && (
                <div className="text-center text-[13px] text-stone-400 py-10">
                  {query ? `No media matches "${query}"` : 'No media uploaded yet.'}
                </div>
              )}
              {!isLoading && filtered.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {filtered.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHoverId(item._id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`relative rounded-lg border overflow-hidden text-left transition ${
                        hoverId === item._id ? 'border-puplar-700 shadow-md' : 'border-stone-200'
                      }`}
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-[100px] w-full object-cover bg-stone-100"
                      />
                      {/* Type badge */}
                      <div className="absolute top-1.5 right-1.5 text-[9px] font-mono uppercase bg-white/85 backdrop-blur px-1.5 py-0.5 rounded">
                        {mimeToLabel(item.type)}
                      </div>
                      {/* Meta */}
                      <div className="px-2.5 py-2">
                        <div className="text-[12px] font-medium text-stone-800 truncate">{item.name}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5 font-mono">{formatBytes(item.size)}</div>
                      </div>
                      {/* Hover overlay */}
                      {hoverId === item._id && (
                        <div className="absolute inset-0 bg-puplar-700/8 flex items-center justify-center pointer-events-none">
                          <div className="bg-puplar-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                            Insert
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Upload tab ── */}
        {tab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`min-h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition ${
                uploading
                  ? 'border-puplar-700 bg-puplar-700/5 cursor-wait'
                  : dragging
                  ? 'border-puplar-700 bg-puplar-700/5 cursor-copy'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 cursor-pointer'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                dragging || uploading ? 'bg-puplar-700/10 text-puplar-700' : 'bg-stone-100 text-stone-400'
              }`}>
                <Ic.Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-[13.5px] font-medium text-stone-800">
                  {uploading ? 'Uploading…' : dragging ? 'Drop to upload' : 'Drop images here'}
                </div>
                {!uploading && (
                  <div className="text-[12px] text-stone-400 mt-0.5">
                    or <span className="text-puplar-700 font-medium">browse files</span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-stone-400 font-mono">PNG · JPG · SVG · GIF · WebP</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4"
              multiple
              className="hidden"
              onChange={(e) => { void processFiles(e.target.files); e.target.value = ''; }}
            />
          </div>
        )}

      </div>
    </div>
  );
}
