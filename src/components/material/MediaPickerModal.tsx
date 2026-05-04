import { useState, useRef } from 'react';
import { Ic } from '../icons';
import { DASH_MEDIA } from '../../data/admin';
import type { AdminMedia } from '../../types/admin';

interface MediaPickerModalProps {
  onSelect: (src: string, alt: string) => void;
  onClose: () => void;
}

type Tab = 'library' | 'upload';

interface UploadedItem {
  id: string;
  name: string;
  src: string;           // data URL from FileReader
  type: AdminMedia['type'];
  w: number;
  h: number;
  size: string;
  hue: number;
}

/** Generates a coloured SVG data URI placeholder for DASH_MEDIA items (no real URL). */
function placeholderSrc(item: AdminMedia): string {
  const bg  = `hsl(${item.hue},40%,75%)`;
  const fg  = `hsl(${item.hue},40%,32%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${item.w}" height="${item.h}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="18" fill="${fg}">${item.name}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function extType(name: string): AdminMedia['type'] {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'JPG';
  if (ext === 'svg') return 'SVG';
  if (ext === 'mp4') return 'MP4';
  return 'PNG';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaPickerModal({ onSelect, onClose }: MediaPickerModalProps) {
  const [tab,       setTab]       = useState<Tab>('library');
  const [query,     setQuery]     = useState('');
  const [hoverId,   setHoverId]   = useState<string | null>(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploads,   setUploads]   = useState<UploadedItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Library items = DASH_MEDIA + uploaded items ──────────────────────────
  const allLibraryItems = [
    ...uploads.map((u) => ({ ...u, isUpload: true as const })),
    ...DASH_MEDIA.map((m) => ({ ...m, isUpload: false as const })),
  ];
  const filtered = allLibraryItems.filter((m) =>
    !query || m.name.toLowerCase().includes(query.toLowerCase()),
  );

  // ── File processing ───────────────────────────────────────────────────────
  function processFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        // Read image dimensions
        const img = new Image();
        img.onload = () => {
          setUploads((prev) => [
            {
              id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              src,
              type: extType(file.name),
              w: img.naturalWidth,
              h: img.naturalHeight,
              size: formatBytes(file.size),
              hue: Math.floor(Math.random() * 360),
            },
            ...prev,
          ]);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
    setTab('library');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }

  // ── Select ────────────────────────────────────────────────────────────────
  function handleSelect(item: typeof allLibraryItems[number]) {
    const src = item.isUpload ? item.src : placeholderSrc(item as AdminMedia);
    onSelect(src, item.name.replace(/\.[^.]+$/, ''));
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
              {allLibraryItems.length} assets · click to insert
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
              <div className="grid grid-cols-3 gap-3">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHoverId(item.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className={`relative rounded-lg border overflow-hidden text-left transition ${
                      hoverId === item.id ? 'border-puplar-700 shadow-md' : 'border-stone-200'
                    }`}
                  >
                    {/* Thumbnail */}
                    {item.isUpload ? (
                      <img
                        src={item.src}
                        alt={item.name}
                        className="h-[100px] w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-[100px] flex items-center justify-center"
                        style={{ background: `hsl(${item.hue},40%,88%)` }}
                      >
                        <span
                          className="text-[11px] font-mono"
                          style={{ color: `hsl(${item.hue},40%,35%)` }}
                        >
                          {item.type}
                        </span>
                      </div>
                    )}
                    {/* Meta */}
                    <div className="px-2.5 py-2">
                      <div className="text-[12px] font-medium text-stone-800 truncate">{item.name}</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">{item.w} × {item.h} · {item.size}</div>
                    </div>
                    {/* Hover overlay */}
                    {hoverId === item.id && (
                      <div className="absolute inset-0 bg-puplar-700/8 flex items-center justify-center pointer-events-none">
                        <div className="bg-puplar-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          Insert
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center text-[13px] text-stone-400 py-10">
                  No media matches "{query}"
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Upload tab ── */}
        {tab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 min-h-[220px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                dragging
                  ? 'border-puplar-700 bg-puplar-700/5'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                dragging ? 'bg-puplar-700/10 text-puplar-700' : 'bg-stone-100 text-stone-400'
              }`}>
                <Ic.Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-[13.5px] font-medium text-stone-800">
                  {dragging ? 'Drop to upload' : 'Drop images here'}
                </div>
                <div className="text-[12px] text-stone-400 mt-0.5">
                  or <span className="text-puplar-700 font-medium">browse files</span>
                </div>
              </div>
              <div className="text-[11px] text-stone-400 font-mono">PNG · JPG · SVG · GIF · WebP</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => processFiles(e.target.files)}
            />

            {/* Recently uploaded (in this session) */}
            {uploads.length > 0 && (
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.08em] text-stone-400 mb-2">
                  Uploaded this session
                </div>
                <div className="flex flex-col gap-1.5">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-stone-100 bg-stone-50/60 hover:bg-stone-50 transition"
                    >
                      <img src={u.src} alt={u.name} className="w-10 h-10 object-cover rounded-md shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-medium text-stone-800 truncate">{u.name}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{u.w} × {u.h} · {u.size}</div>
                      </div>
                      <button
                        onClick={() => { onSelect(u.src, u.name.replace(/\.[^.]+$/, '')); onClose(); }}
                        className="text-[12px] font-medium text-puplar-700 hover:text-puplar-900 transition shrink-0"
                      >
                        Insert
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
