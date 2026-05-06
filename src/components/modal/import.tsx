import { useState, useRef } from 'react';
import { Ic } from '../icons';
import { Avatar } from '../material';
import { DASH_CATEGORIES } from '../../data/admin';

interface ImportModalProps {
  onClose: () => void;
}

interface PendingFile {
  name: string;
  size: string;
  progress: number;
}

const ACCEPTED = ['.md', '.mdx', '.docx', '.html'];
const AUTHORS = ['Ada O.', 'Tomás R.', 'Priya B.', 'Lena M.', 'Remi A.'];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<PendingFile | null>(null);
  const [category, setCategory] = useState(DASH_CATEGORIES[0].name);
  const [author, setAuthor] = useState(AUTHORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile({ name: f.name, size: formatSize(f.size), progress: 68 });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm grid place-items-center p-8">
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xl w-[640px] max-w-full overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-[16px] text-stone-900">Import a post</div>
            <div className="text-[12px] text-stone-500">Drop a file or browse to create a draft.</div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition">
            <Ic.X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 grid place-items-center text-center cursor-pointer transition ${
              dragging ? 'border-puplar-700 bg-puplar-700/5' : 'border-stone-300 bg-stone-50/60 hover:border-stone-400'
            }`}
          >
            <div className={`w-11 h-11 rounded-full grid place-items-center mb-2 transition ${
              dragging ? 'bg-puplar-700/20 text-puplar-700' : 'bg-puplar-700/10 text-puplar-700'
            }`}>
              <Ic.Upload className="w-5 h-5" />
            </div>
            <div className="font-display font-semibold text-[15px] text-stone-900">
              {dragging ? 'Release to import' : 'Drop file to import'}
            </div>
            <div className="text-[12px] text-stone-500 mt-0.5">
              {ACCEPTED.join(', ')} — up to 25 MB
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="mt-3 text-[12px] font-semibold text-white bg-puplar-700 hover:bg-puplar-900 rounded-md px-3 py-1.5 transition"
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* File in progress */}
          {file && (
            <div className="rounded-lg border border-stone-200 p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-puplar-700/10 grid place-items-center text-puplar-700 shrink-0">
                  <Ic.Doc className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-stone-900 truncate">{file.name}</div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    {file.size} · {file.progress < 100 ? 'uploading…' : 'ready'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 font-mono">{file.progress}%</span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-stone-400 hover:text-stone-700 transition"
                  >
                    <Ic.X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-puplar-700 rounded-full transition-all"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-stone-500">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-stone-200 rounded px-2 py-1.5 w-full bg-white text-[12.5px] text-stone-800 focus:outline-none focus:border-puplar-700"
              >
                {DASH_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-stone-500">Author</span>
              <div className="relative">
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="border border-stone-200 rounded pl-8 pr-2 py-1.5 w-full bg-white text-[12.5px] text-stone-800 focus:outline-none focus:border-puplar-700 appearance-none"
                >
                  {AUTHORS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <div className="absolute left-2 top-1.5 pointer-events-none">
                  <Avatar name={author} size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-[12.5px] text-stone-700 px-3 py-1.5 hover:bg-stone-100 rounded-md transition"
          >
            Cancel
          </button>
          <button
            disabled={!file}
            className="text-[12.5px] font-semibold text-white bg-puplar-700 hover:bg-puplar-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-md px-3 py-1.5 transition"
          >
            Save as draft
          </button>
        </div>

      </div>
    </div>
  );
}
