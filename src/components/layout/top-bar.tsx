import type { ReactNode } from 'react';
import { Ic } from '../icons';
import { Avatar } from '../material';
import { useAuthor } from '@/hooks/use-api';

interface DashTopBarProps {
  breadcrumbs?: string[];
  title?: string;
  children?: ReactNode;
}

export function DashTopBar({ breadcrumbs = [], title, children }: DashTopBarProps) {
  const { author, isLoading } = useAuthor();
  const displayName = author?.name || 'User';

  return (
    <header className="h-14 border-b border-stone-200 bg-white px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-[14px]">
        {breadcrumbs.length > 0
          ? breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <Ic.Chevron className="w-3.5 h-3.5 text-stone-400" />}
              <span className={i === breadcrumbs.length - 1 ? 'text-stone-900 font-semibold' : 'text-stone-500'}>
                {b}
              </span>
            </span>
          ))
          : title && (
            <span className="font-display font-semibold text-[15px] text-stone-900 tracking-[-0.005em]">
              {title}
            </span>
          )}
      </div>

      <div className="flex items-center gap-3">
        {children}

        <div className="relative">
          <Ic.Search className="absolute left-2.5 top-2 w-4 h-4 text-stone-400" />
          <input
            placeholder="Search posts, media, tags…"
            className="pl-8 pr-8 py-1.5 text-[13px] border border-stone-200 rounded-md w-[260px] bg-stone-50 focus:bg-white focus:border-puplar-700 outline-none"
          />
          <kbd className="absolute right-2 top-1.5 text-[10px] font-mono text-stone-400 bg-white border border-stone-200 px-1 rounded">
            ⌘K
          </kbd>
        </div>

        <button className="relative p-1.5 text-stone-500 hover:text-stone-900 transition">
          <Ic.Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {isLoading ?
          <div className="size-[26px] rounded-full bg-stone-100 flex items-center justify-center"></div> :
          <Avatar name={displayName} size={26} />
        }
      </div>
    </header>
  );
}
