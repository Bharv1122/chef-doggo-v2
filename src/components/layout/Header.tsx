import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  title?: string;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, backTo, backLabel, actions, transparent }: HeaderProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={['sticky top-0 z-40 w-full border-b border-[#E7E5E4]', transparent ? 'bg-transparent' : 'bg-[#FFFBF5]/95 backdrop-blur-sm'].join(' ')}>
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        {backTo ? (
          <Link to={backTo} className="flex items-center gap-1 text-sm text-[#78716C] hover:text-[#1C1917] transition-colors shrink-0 -ml-1">
            <ChevronLeft size={18} />
            <span>{backLabel ?? 'Back'}</span>
          </Link>
        ) : (
          <Link to="/" className="shrink-0">
            <Logo size="sm" showText={isHome} />
          </Link>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-sm font-semibold text-[#1C1917] truncate">{title}</h1>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
