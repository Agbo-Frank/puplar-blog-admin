import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Ic } from '../../components/icons';
import type { ICategory } from '@/api/types';

export interface RowMenuProps {
  category: ICategory;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function RowMenu({ category, onEdit, onDelete, onClose }: RowMenuProps) {
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
        <span className="ml-auto text-[11px] font-mono text-stone-400">{category.post_count}</span>
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
