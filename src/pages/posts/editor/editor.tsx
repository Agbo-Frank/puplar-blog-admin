import { useState, useEffect, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { Ic } from '../../../components/icons';
import { MediaPickerModal } from '../../../components/material/MediaPickerModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlashItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  command: () => void;
}

interface EditorCanvasProps {
  editor: Editor | null;
  title: string;
  excerpt: string;
  category: string;
  status: string;
  onTitleChange: (v: string) => void;
  onExcerptChange: (v: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorCanvas({
  editor, title, excerpt, category, status,
  onTitleChange, onExcerptChange,
}: EditorCanvasProps) {
  const titleSeeded   = useRef(false);
  const excerptSeeded = useRef(false);
  const slashRef      = useRef<HTMLDivElement>(null);

  const [showSlash,  setShowSlash]  = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos,   setSlashPos]   = useState({ top: 0, left: 0 });
  const [activeIdx,  setActiveIdx]  = useState(0);

  const [showMediaPick, setShowMediaPick] = useState(false);

  // ── Slash items ────────────────────────────────────────────────────────────
  const allItems: SlashItem[] = editor ? [
    { icon: Ic.H1,    label: 'Heading 1',     desc: 'Big section title',          command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: Ic.H2,    label: 'Heading 2',     desc: 'Medium heading',             command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: Ic.List,  label: 'Bulleted list', desc: 'Simple unordered list',      command: () => editor.chain().focus().toggleBulletList().run() },
    { icon: Ic.Quote, label: 'Quote',         desc: 'Pull quote / blockquote',    command: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: Ic.Code,  label: 'Code block',    desc: 'Syntax-highlighted code',    command: () => editor.chain().focus().toggleCodeBlock().run() },
    { icon: Ic.Image, label: 'Image',         desc: 'Insert from media library',  command: () => setShowMediaPick(true) },
  ] : [];

  const filtered = allItems.filter(
    (item) => !slashQuery || item.label.toLowerCase().includes(slashQuery.toLowerCase()),
  );

  // ── Detect / to open slash menu ────────────────────────────────────────────
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      const { selection } = editor.state;
      const { $from } = selection;
      if ($from.parent.type.name !== 'paragraph') { setShowSlash(false); return; }
      const text = $from.parent.textContent;
      if (text.startsWith('/')) {
        setSlashQuery(text.slice(1));
        setActiveIdx(0);
        const coords = editor.view.coordsAtPos(selection.from);
        setSlashPos({ top: coords.bottom + 6, left: coords.left });
        setShowSlash(true);
      } else {
        setShowSlash(false);
      }
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor]);

  // ── Click-outside: close slash menu ───────────────────────────────────────
  useEffect(() => {
    if (!showSlash) return;
    function handle(e: MouseEvent) {
      if (slashRef.current && !slashRef.current.contains(e.target as Node)) {
        setShowSlash(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showSlash]);

  // ── Keyboard nav inside slash menu ────────────────────────────────────────
  useEffect(() => {
    if (!showSlash) return;
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape')    { setShowSlash(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' && filtered[activeIdx]) { e.preventDefault(); applySlashItem(filtered[activeIdx]); }
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [showSlash, filtered, activeIdx]);

  function applySlashItem(item: SlashItem) {
    if (!editor) return;
    const { from } = editor.state.selection;
    const text = editor.state.selection.$from.parent.textContent;
    editor.chain().focus().deleteRange({ from: from - text.length, to: from }).run();
    item.command();
    setShowSlash(false);
    setSlashQuery('');
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-8 py-12">

          {/* Category · Status label */}
          <div className="text-[12px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-3">
            {category} · {status}
          </div>

          {/* Title */}
          <h1
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Untitled post"
            ref={(el) => {
              if (el && !titleSeeded.current) {
                titleSeeded.current = true;
                el.textContent = title;
              }
            }}
            onInput={(e) => onTitleChange(e.currentTarget.textContent ?? '')}
            className="font-display font-bold text-[44px] leading-[1.05] tracking-[-0.03em] text-stone-900 m-0 outline-none
              empty:before:content-[attr(data-placeholder)] empty:before:text-stone-300 empty:before:pointer-events-none"
          />

          {/* Excerpt */}
          <p
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Write a brief excerpt for this post…"
            ref={(el) => {
              if (el && !excerptSeeded.current) {
                excerptSeeded.current = true;
                el.textContent = excerpt;
              }
            }}
            onInput={(e) => onExcerptChange(e.currentTarget.textContent ?? '')}
            className="text-[18px] text-stone-500 mt-4 leading-[1.45] outline-none
              empty:before:content-[attr(data-placeholder)] empty:before:text-stone-300 empty:before:pointer-events-none"
          />

          {/* TipTap editor body */}
          <EditorContent
            editor={editor}
            className="tiptap-canvas mt-10"
          />

          {/* Slash menu (fixed positioning from coordsAtPos) */}
          {showSlash && filtered.length > 0 && (
            <div
              ref={slashRef}
              style={{ top: slashPos.top, left: slashPos.left }}
              className="fixed z-50 bg-white border border-stone-200 rounded-lg shadow-xl w-[280px] py-1.5"
            >
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.1em] text-stone-500">
                Basic blocks
              </div>
              {filtered.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onMouseDown={(e) => { e.preventDefault(); applySlashItem(item); }}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 text-left transition ${
                      i === activeIdx ? 'bg-stone-100' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded border border-stone-200 grid place-items-center text-stone-700 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-stone-900">{item.label}</div>
                      <div className="text-[11px] text-stone-500">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Media picker — opened by Image slash item */}
      {showMediaPick && editor && (
        <MediaPickerModal
          onClose={() => { setShowMediaPick(false); editor.commands.focus(); }}
          onSelect={(src, alt) => {
            editor.chain().focus().setImage({ src, alt }).run();
          }}
        />
      )}

    </div>
  );
}
