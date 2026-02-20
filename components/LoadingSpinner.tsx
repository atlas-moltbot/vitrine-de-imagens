import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4 border-[1.5px]', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-2' };
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizes[size]} border-zinc-700 border-t-indigo-500 rounded-full animate-spin-slow`}></div>
    </div>
  );
};