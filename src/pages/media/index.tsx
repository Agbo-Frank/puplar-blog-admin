import { useState, useRef } from 'react';
import { DashTopBar } from '../../components/layout/top-bar';
import { Ic } from '../../components/icons';
import { Thumb, Button } from '../../components/material';
import { useApi, useMutation } from '@/hooks/use-api';
import { endpoints } from '@/api/endpoints';
import { post } from '@/api/fetcher';
import type { IMedia, IPagination } from '@/api/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function mimeToLabel(type: string): string {
  if (type === 'image/jpeg') return 'JPG';
  if (type === 'image/png') return 'PNG';
  if (type === 'image/svg+xml') return 'SVG';
  if (type === 'video/mp4') return 'MP4';
  if (type === 'image/gif') return 'GIF';
  if (type === 'image/webp') return 'WEBP';
  return type.split('/').pop()?.toUpperCase() ?? 'FILE';
}

function hueFromId(id: string): number {
  return parseInt(id.slice(-6), 16) % 360;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaRes, isLoading, mutate } = useApi<IPagination<IMedia>>(endpoints.media);
  const media = mediaRes?.data?.docs ?? [];

  const { trigger: deleteMedia } = useMutation(
    endpoints.mediaDetails,
    { method: 'DELETE', invalidate: [endpoints.media] }
  );

  // ── Upload ──────────────────────────────────────────────────────────────────
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
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete(id: string) {
    await deleteMedia(undefined, { id });
    setDeletingId(null);
  }

  const isEmpty = !isLoading && media.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DashTopBar title="Media" />

      <div className="flex-1 bg-stone-50 overflow-y-auto">
        <div className="px-8 pt-7 pb-5 flex items-end justify-between">
          <div>
            <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 m-0">Media</h1>
            <p className="text-[13px] text-stone-500 mt-1">
              Hero images, diagrams, and assets used across posts.
            </p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
            <Ic.Upload className="w-3.5 h-3.5" /> Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4"
            multiple
            className="hidden"
            onChange={(e) => { void processFiles(e.target.files); e.target.value = ''; }}
          />
        </div>

        <div className="px-8 pb-8">
          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-16 text-[13px] text-stone-400">Loading…</div>
          )}

          {/* Empty state — also acts as the upload drop zone */}
          {isEmpty && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); void processFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 rounded-xl bg-white grid place-items-center min-h-[260px] text-center px-6 hover:border-puplar-700 hover:bg-stone-50/60 transition cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 mx-auto rounded-full bg-puplar-700/10 grid place-items-center text-puplar-700 mb-3">
                  <Ic.Upload className="w-5 h-5" />
                </div>
                <div className="text-[14px] font-semibold text-stone-900">Drop files here or click Upload</div>
                <div className="text-[12px] text-stone-500 mt-1">PNG · JPG · SVG · MP4</div>
              </div>
            </div>
          )}

          {/* Media grid */}
          {!isLoading && media.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {media.map((m) => {
                const isDeleting = deletingId === m._id;
                return (
                  <div
                    key={m._id}
                    className={`bg-white border rounded-lg overflow-hidden group transition ${
                      isDeleting ? 'border-red-300 shadow-sm' : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative">
                      {/* Thumbnail */}
                      {m.url ? (
                        <img
                          src={m.url}
                          alt={m.name}
                          className="w-full object-cover"
                          style={{ height: 140 }}
                        />
                      ) : (
                        <Thumb hue={hueFromId(m._id)} w="100%" h={140} />
                      )}

                      {/* Type badge */}
                      <div className="absolute top-2 right-2 text-[10px] font-mono uppercase bg-white/85 backdrop-blur px-1.5 py-0.5 rounded">
                        {mimeToLabel(m.type)}
                      </div>

                      {/* Used badge */}
                      {m.usage_count > 0 && (
                        <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-stone-900/80 text-white px-1.5 py-0.5 rounded">
                          used in {m.usage_count}
                        </div>
                      )}

                      {/* Delete button — visible on hover */}
                      {!isDeleting && (
                        <button
                          onClick={() => setDeletingId(m._id)}
                          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/85 backdrop-blur grid place-items-center text-stone-400 hover:text-red-500 hover:bg-white transition opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Ic.X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="p-2.5">
                      <div className="text-[12.5px] font-medium text-stone-900 truncate">{m.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{formatBytes(m.size)}</div>
                    </div>

                    {/* Inline delete confirmation */}
                    {isDeleting && (
                      <div className="px-2.5 pb-2.5 flex items-center justify-between gap-2">
                        <span className="text-[11.5px] text-red-600 font-medium">Delete this file?</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-[11px] text-stone-600 border border-stone-200 rounded px-2 py-0.5 hover:bg-stone-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => void confirmDelete(m._id)}
                            className="text-[11px] font-semibold text-white bg-red-500 rounded px-2 py-0.5 hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
