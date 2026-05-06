import { STATUS_META } from '../../data/admin';
import type { PostStatus } from '../../types/admin';

interface StatusPillProps {
  status: PostStatus;
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const meta = STATUS_META[status];
  const padding = size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-[12px] px-2 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded font-medium ${padding} ${meta.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
