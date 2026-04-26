import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[#f97316] hover:bg-[#ea6a0c] text-white border border-[#f97316] shadow-sm',
  secondary: 'bg-white hover:bg-[#fff6ec] text-[#2b2118] border border-[#eadfce] shadow-sm',
  ghost: 'bg-transparent hover:bg-[#fff6ec] text-[#6f6459] hover:text-[#2b2118] border border-transparent',
  danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white border border-[#ef4444] shadow-sm',
  success: 'bg-[#43a365] hover:bg-[#398b56] text-white border border-[#43a365] shadow-sm',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-2xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/35 disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
