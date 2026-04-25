import React from 'react';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showLabel?: boolean;
  color?: 'orange' | 'green' | 'amber';
  size?: 'sm' | 'md';
}

const COLORS = {
  orange: 'bg-[#F97316]',
  green: 'bg-[#22C55E]',
  amber: 'bg-[#F59E0B]',
};

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5' };

export function ProgressBar({ value, label, showLabel = false, color = 'orange', size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex justify-between text-xs text-[#78716C] mb-1">
          {label && <span>{label}</span>}
          {showLabel && <span>{clamped}%</span>}
        </div>
      )}
      <div className={['w-full bg-[#E7E5E4] rounded-full overflow-hidden', HEIGHTS[size]].join(' ')}>
        <div
          className={['h-full rounded-full transition-all duration-500', COLORS[color]].join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function StepProgress({ currentStep, totalSteps, stepLabels }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-0">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <React.Fragment key={i}>
            <div className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border-2 transition-colors',
              i < currentStep
                ? 'bg-[#F97316] border-[#F97316] text-white'
                : i === currentStep
                ? 'bg-white border-[#F97316] text-[#F97316]'
                : 'bg-white border-[#E7E5E4] text-[#78716C]',
            ].join(' ')}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={['flex-1 h-0.5', i < currentStep ? 'bg-[#F97316]' : 'bg-[#E7E5E4]'].join(' ')} />
            )}
          </React.Fragment>
        ))}
      </div>
      {stepLabels && (
        <div className="flex justify-between mt-2">
          {stepLabels.map((label, i) => (
            <span key={i} className={['text-xs font-medium', i <= currentStep ? 'text-[#F97316]' : 'text-[#A8A29E]'].join(' ')}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
