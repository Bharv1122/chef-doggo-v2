import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

export function Card({ children, className = '', onClick, hoverable, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-3xl border border-[#eadfce] bg-[#fffdf9] shadow-sm',
        PADDING[padding],
        hoverable || onClick ? 'cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function CardSection({ children, className = '', title }: CardSectionProps) {
  return (
    <div className={['mt-4 border-t border-[#eadfce] pt-4', className].join(' ')}>
      {title && <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8b8378]">{title}</h3>}
      {children}
    </div>
  );
}
