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
