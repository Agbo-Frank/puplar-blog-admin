import { createPortal } from 'react-dom';
import {
  useFloating,
  offset,
  flip,
  shift,
  size as floatingSize,
  type VirtualElement,
} from '@floating-ui/react';
import { useEffect, useState } from 'react';
import { Ic } from '../../../components/icons';
import type { Editor } from '@tiptap/react';

interface SlashItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  command: () => void;
}


interface SlashMenuProps {
  editor: Editor | null;
  setShowMediaPick: (show: boolean) => void;
}

export default function SlashMenu({
  editor,
  setShowMediaPick,
}: SlashMenuProps) {
  const [showSlash, setShowSlash] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [cursorRect, setCursorRect] = useState<DOMRect | null>(null);

  const { refs, floatingStyles, update } = useFloating({
    open: showSlash,
    placement: 'bottom-start',
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ['top-start'] }),
      shift({ padding: 8 }),
      floatingSize({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight, 320)}px`,
          });
        },
        padding: 8,
      }),
    ],
  });

  const allItems: SlashItem[] = editor ? [
    { icon: Ic.H1, label: 'Heading 1', desc: 'Big section title', command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: Ic.H2, label: 'Heading 2', desc: 'Medium heading', command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: Ic.List, label: 'Bulleted list', desc: 'Simple unordered list', command: () => editor.chain().focus().toggleBulletList().run() },
    { icon: Ic.Quote, label: 'Quote', desc: 'Pull quote / blockquote', command: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: Ic.Code, label: 'Code block', desc: 'Syntax-highlighted code', command: () => editor.chain().focus().toggleCodeBlock().run() },
    { icon: Ic.Image, label: 'Image', desc: 'Insert from media library', command: () => setShowMediaPick(true) },
  ] : [];

  const filtered = allItems.filter(
    (item) => !slashQuery || item.label.toLowerCase().includes(slashQuery.toLowerCase()),
  );

  function applySlashItem(item: SlashItem) {
    if (!editor) return;
    const { from } = editor.state.selection;
    const text = editor.state.selection.$from.parent.textContent;
    editor.chain().focus().deleteRange({ from: from - text.length, to: from }).run();
    item.command();
    setShowSlash(false);
    setSlashQuery('');
  }

  useEffect(() => {
    if (!cursorRect) return;
    const virtual: VirtualElement = {
      getBoundingClientRect: () => cursorRect,
    };
    refs.setReference(virtual);
    update();
  }, [cursorRect, refs, update]);

  useEffect(() => {
    if (!showSlash) return;
    function handle(e: MouseEvent) {
      const floating = refs.floating.current;
      if (floating && !floating.contains(e.target as Node)) setShowSlash(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showSlash, refs.floating]);

  useEffect(() => {
    if (!showSlash) return;
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') { setShowSlash(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' && filtered[activeIdx]) { e.preventDefault(); applySlashItem(filtered[activeIdx]); }
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [showSlash, filtered, activeIdx]);

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
        const rect = new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top);
        setCursorRect(rect);
        setShowSlash(true);
      } else {
        setShowSlash(false);
      }
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor, update]);

  if (!showSlash || filtered.length === 0) {
    return null;
  }

  return createPortal(
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 bg-white border border-stone-200 rounded-lg shadow-xl w-[280px] py-1.5 overflow-y-auto"
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
            className={`w-full flex items-start gap-2.5 px-3 py-2 text-left transition ${i === activeIdx ? 'bg-stone-100' : 'hover:bg-stone-50'
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
    </div>,
    document.body
  )
}