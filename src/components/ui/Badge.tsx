import React from 'react';

type BadgeVariant = 'orange' | 'green' | 'amber' | 'red' | 'gray' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

const VARIANTS: Record<BadgeVariant, string> = {
  orange: 'bg-orange-100 text-orange-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-stone-100 text-stone-600',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ children, variant = 'gray', className = '', icon }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        VARIANTS[variant],
        className,
      ].join(' ')}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
