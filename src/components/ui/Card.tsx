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
        'bg-white rounded-2xl shadow-sm border border-[#E7E5E4]',
        PADDING[padding],
        hoverable || onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-150' : '',
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
    <div className={['border-t border-[#E7E5E4] pt-4 mt-4', className].join(' ')}>
      {title && <h3 className="text-sm font-semibold text-[#78716C] uppercase tracking-wide mb-3">{title}</h3>}
      {children}
    </div>
  );
}
