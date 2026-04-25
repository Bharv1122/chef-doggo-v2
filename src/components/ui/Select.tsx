import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, hint, options, placeholder, className = '', id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1C1917]">
          {label}
          {props.required && <span className="text-[#F97316] ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        {...props}
        className={[
          'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-[#1C1917] transition-colors appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]',
          error ? 'border-red-400' : 'border-[#E7E5E4]',
          className,
        ].join(' ')}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-[#78716C]">{hint}</p>}
    </div>
  );
}
