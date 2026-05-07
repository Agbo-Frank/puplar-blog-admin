import { useState, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { MediaPickerModal } from '../../../components/modal/media-picker';
import SlashMenu from './slash-menu';

interface EditorCanvasProps {
  editor: Editor | null;
  title: string;
  excerpt: string;
  category: string;
  status: string;
  onTitleChange: (v: string) => void;
  onExcerptChange: (v: string) => void;
}

export function EditorCanvas({
  editor, title, excerpt, category, status,
  onTitleChange, onExcerptChange,
}: EditorCanvasProps) {
  const titleSeeded = useRef(false);
  const excerptSeeded = useRef(false);
  const [showMediaPick, setShowMediaPick] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-8 py-12">

          {/* Category · Status label */}
          <div className="text-[12px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-3">
            {category ? `${category} · ${status}` : status}
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

        </div>
      </div>
      <SlashMenu
        editor={editor}
        setShowMediaPick={setShowMediaPick}
      />

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
