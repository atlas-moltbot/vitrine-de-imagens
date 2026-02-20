import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div
        className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-[200px] px-3 py-1.5 bg-zinc-800 text-zinc-200 text-xs font-medium rounded-md border border-zinc-700 z-50 transition-opacity duration-150 text-center`}
      >
        {content}
      </div>
    </div>
  );
};