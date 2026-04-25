import React from 'react';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';

type DisclaimerVariant = 'info' | 'warning' | 'safety';

interface DisclaimerProps {
  children: React.ReactNode;
  variant?: DisclaimerVariant;
  title?: string;
  className?: string;
}

const STYLES: Record<DisclaimerVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <Info size={16} />,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: <AlertTriangle size={16} />,
  },
  safety: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <ShieldCheck size={16} />,
  },
};

export function Disclaimer({ children, variant = 'info', title, className = '' }: DisclaimerProps) {
  const s = STYLES[variant];
  return (
    <div className={['rounded-xl border p-4', s.bg, s.border, s.text, className].join(' ')}>
      <div className="flex gap-3">
        <span className="shrink-0 mt-0.5">{s.icon}</span>
        <div className="text-sm">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
