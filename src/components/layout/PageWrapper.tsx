import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageWrapper({ children, className = '', noPadding }: PageWrapperProps) {
  return (
    <main className={['max-w-[56rem] mx-auto w-full pb-28', noPadding ? '' : 'px-4 sm:px-6 py-6', className].join(' ')}>
      {children}
    </main>
  );
}
