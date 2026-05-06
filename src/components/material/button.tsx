import { cn } from '@/utils';

// ─── Button ───────────────────────────────────────────────────────────────────

const BUTTON_BASE = 'inline-flex items-center gap-1.5 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';

const BUTTON_VARIANT = {
  primary:   'text-white bg-puplar-700 hover:bg-puplar-900 rounded-md',
  secondary: 'text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md',
  danger:    'text-white bg-red-500 hover:bg-red-600 rounded-md',
} as const;

const BUTTON_SIZE = {
  md: 'text-[13px] px-3.5 py-1.5',
  sm: 'text-[12px] px-2.5 py-1',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANT;
  size?:    keyof typeof BUTTON_SIZE;
  loading?: boolean;
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[size], className)}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}

// ─── IconButton ───────────────────────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function IconButton({ destructive = false, className, ...props }: IconButtonProps) {
  return (
    <button
      className={cn(
        'transition disabled:opacity-50 disabled:cursor-not-allowed',
        destructive
          ? 'text-stone-400 hover:text-red-500'
          : 'text-stone-400 hover:text-stone-700',
        className
      )}
      {...props}
    />
  );
}
