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
        className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-[200px] px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg shadow-xl border border-gray-700 z-50 animate-fade-in text-center`}
      >
        {content}
        {/* Arrow */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${position === 'top' ? 'top-full border-t-gray-800' : 'bottom-full border-b-gray-800'}`}
        ></div>
      </div>
    </div>
  );
};