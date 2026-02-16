import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageComparisonProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({ 
  before, 
  after,
  beforeLabel = "Original",
  afterLabel = "Editada" 
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const position = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(position);
    }
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onTouchStart = () => setIsDragging(true);

  const onMouseUp = () => setIsDragging(false);
  const onTouchEnd = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  const onClick = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  // Add global event listeners to handle dragging outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, handleMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden select-none cursor-ew-resize group rounded-xl border border-gray-700 shadow-2xl"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onClick={onClick}
    >
      {/* Background Image (Modified/After) */}
      <img 
        src={after} 
        alt="After" 
        className="block w-full h-auto object-contain pointer-events-none" 
      />
      
      {/* Label for After */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-none z-10">
        {afterLabel}
      </div>

      {/* Foreground Image (Original/Before) - Clipped */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="absolute top-0 left-0 w-full h-full object-contain max-w-none" 
          // Note: We force the image to match the container width regardless of the clipping parent's width
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }}
        />
         {/* Label for Before */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10 shadow-lg z-10">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gray-200">
          <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
          </svg>
        </div>
      </div>
    </div>
  );
};