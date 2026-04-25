import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, PawPrint, Sparkles, MessageCircle } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',          icon: Home,          label: 'Home' },
  { to: '/recipes',   icon: BookOpen,       label: 'Recipes' },
  { to: '/profiles',  icon: PawPrint,       label: 'My Dogs' },
  { to: '/treats',    icon: Sparkles,       label: 'Treats' },
  { to: '/assistant', icon: MessageCircle,  label: 'Ask Chef' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#E7E5E4] pb-safe no-print">
      <div className="max-w-2xl mx-auto flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              ['flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
               isActive ? 'text-[#F97316]' : 'text-[#78716C] hover:text-[#1C1917]'].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
