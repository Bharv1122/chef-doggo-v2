import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Bone,
  Home,
  MessageCircle,
  PawPrint,
  Settings,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '../ui/Button';

type MainNavKey = 'home' | 'recipes' | 'dogs' | 'treats' | 'assistant';

interface AppShellProps {
  active: MainNavKey;
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}

const TOP_ITEMS: Array<{ key: MainNavKey; to: string; label: string; icon: React.ReactNode }> = [
  { key: 'home', to: '/', label: 'Home', icon: <Home size={16} /> },
  { key: 'recipes', to: '/recipes', label: 'Recipes', icon: <BookOpen size={16} /> },
  { key: 'dogs', to: '/profiles', label: 'My Dogs', icon: <PawPrint size={16} /> },
  { key: 'treats', to: '/treats', label: 'Treats', icon: <Bone size={16} /> },
  { key: 'assistant', to: '/assistant', label: 'Ask Chef', icon: <MessageCircle size={16} /> },
];

const SIDE_ITEMS = [
  { to: '/', label: 'Home', icon: <Home size={21} /> },
  { to: '/recipes', label: 'Recipes', icon: <BookOpen size={21} /> },
  { to: '/profiles', label: 'My Dogs', icon: <PawPrint size={21} /> },
  { to: '/treats', label: 'Treats', icon: <Sparkles size={21} /> },
  { to: '/assistant', label: 'Ask Chef', icon: <MessageCircle size={21} /> },
  { to: '/calculator', label: 'Settings', icon: <Settings size={21} /> },
];

export function AppShell({ active, children, rightRail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#fffbf5]">
      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#fffbf5]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center gap-6 px-6">
          <Link to="/" className="shrink-0">
            <Logo size="md" className="gap-3" />
            <p className="ml-12 -mt-1 text-xs text-[#8b8378]">Homemade Dog Food Made Simple</p>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-3 lg:flex">
            {TOP_ITEMS.map(item => (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.to === '/'}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[1rem] font-medium transition-colors',
                  item.key === active
                    ? 'text-[#f97316] border-b-2 border-[#f97316] rounded-b-none'
                    : 'text-[#6f6459] hover:text-[#2b2118]',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Button size="sm" icon={<Plus size={16} />} onClick={() => (window.location.href = '/wizard')}>
              Start New Bowl
            </Button>
            <button className="grid h-11 w-11 place-items-center rounded-full border border-[#eadfce] bg-white text-[#7f7469]">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-2 py-1.5">
              <img src="/chef-doggo-logo.webp" alt="User" className="h-9 w-9 rounded-full object-cover" />
              <div className="hidden pr-1 sm:block">
                <p className="text-sm font-semibold leading-tight text-[#2b2118]">Sarah</p>
                <p className="text-xs leading-tight text-[#8b8378]">Dog Parent</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="doggo-card hidden p-3 lg:block">
          <div className="space-y-1">
            {SIDE_ITEMS.map(item => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-[1.75rem] transition-colors',
                  isActive
                    ? 'bg-[#fff3e5] text-[#f97316]'
                    : 'text-[#5f564d] hover:bg-[#fff8ef] hover:text-[#2b2118]',
                ].join(' ')}
              >
                {item.icon}
                <span className="text-base font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-[#d6ebda] bg-[#f2fbf4] p-4 text-sm text-[#4f8f64]">
            <p className="font-semibold">Always consult your veterinarian</p>
            <p className="mt-2 text-xs leading-relaxed text-[#63846d]">
              Chef Doggo provides educational guidance only. For medical conditions, consult a licensed vet.
            </p>
            <button className="mt-3 text-xs font-semibold text-[#2f8e56]">Learn more →</button>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>

        {rightRail && <aside className="hidden min-w-0 space-y-4 xl:block">{rightRail}</aside>}
      </div>
    </div>
  );
}
