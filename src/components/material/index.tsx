import { STATUS_META } from '../../data/admin';
import type { PostStatus } from '../../types/admin';
import logoLight from '../../assets/logo-light.png';
import logoDark  from '../../assets/logo-dark.png';

// ─── Logo ─────────────────────────────────────────────────────────────────────

interface LogoProps {
  color?: 'light' | 'dark';
  className?: string;
}

export function Logo({ color = 'dark', className = 'h-7' }: LogoProps) {
  return (
    <img src={color === 'light' ? logoLight : logoDark} alt="Puplar" className={className} />
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 24 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full shrink-0 grid place-items-center font-body font-semibold text-white select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `hsl(${hue} 55% 52%)`,
      }}
    >
      {initials}
    </div>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────

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

// ─── Thumb ────────────────────────────────────────────────────────────────────

interface ThumbProps {
  hue: number;
  w: string | number;
  h: number;
  label?: string;
  className?: string;
}

export function Thumb({ hue, w, h, label, className = '' }: ThumbProps) {
  return (
    <div
      className={`shrink-0 ${className}`}
      style={{
        background: `hsl(${hue} 60% 88%)`,
        width: typeof w === 'number' ? `${w}px` : w,
        height: h,
      }}
    >
      {label && (
        <div className="h-full grid place-items-center font-mono text-[10px] uppercase tracking-[0.08em] text-stone-600/60">
          {label}
        </div>
      )}
    </div>
  );
}

// ─── PuplarMark ───────────────────────────────────────────────────────────────

interface PuplarMarkProps {
  light?: boolean;
}

export function PuplarMark({ light = false }: PuplarMarkProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-puplar-700 text-white grid place-items-center font-display font-bold text-[15px]">
        P
      </div>
      <div className={'font-display font-bold text-[19px] tracking-[-0.02em] ' + (light ? 'text-white' : 'text-puplar-900')}>
        puplar
      </div>
    </div>
  );
}
