import React, { useState, useRef, useEffect } from 'react';

interface ImageRegionSelectorProps {
  imageSrc: string;
  onRegionChange: (coords: number[] | null) => void;
  enabled: boolean;
  onClear?: () => void;
}

export const ImageRegionSelector: React.FC<ImageRegionSelectorProps> = ({ 
  imageSrc, 
  onRegionChange, 
  enabled,
  onClear
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [currentRect, setCurrentRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  const getNormalizedCoords = (rect: {x: number, y: number, w: number, h: number}) => {
    if (!containerRef.current) return null;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    const ymin = Math.round((rect.y / height) * 1000);
    const xmin = Math.round((rect.x / width) * 1000);
    const ymax = Math.round(((rect.y + rect.h) / height) * 1000);
    const xmax = Math.round(((rect.x + rect.w) / width) * 1000);

    return [ymin, xmin, ymax, xmax];
  };

  const startAction = (clientX: number, clientY: number) => {
    if (!enabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setStartPos({ x, y });
    setCurrentRect({ x, y, w: 0, h: 0 });
    setIsDrawing(true);
    
    onRegionChange(null);
    if (onClear) onClear();
  };

  const moveAction = (clientX: number, clientY: number) => {
    if (!isDrawing || !startPos || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(rect.left, Math.min(clientX, rect.right));
    const y = Math.max(rect.top, Math.min(clientY, rect.bottom));
    
    const currentX = x - rect.left;
    const currentY = y - rect.top;

    const newX = Math.min(startPos.x, currentX);
    const newY = Math.min(startPos.y, currentY);
    const newW = Math.abs(currentX - startPos.x);
    const newH = Math.abs(currentY - startPos.y);

    setCurrentRect({ x: newX, y: newY, w: newW, h: newH });
  };

  const endAction = () => {
    if (!isDrawing || !currentRect) return;
    setIsDrawing(false);
    
    if (currentRect.w > 10 && currentRect.h > 10) {
      const normalized = getNormalizedCoords(currentRect);
      onRegionChange(normalized);
    } else {
      setCurrentRect(null);
      onRegionChange(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => startAction(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => moveAction(e.clientX, e.clientY);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (enabled) e.preventDefault();
    const touch = e.touches[0];
    startAction(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (enabled) e.preventDefault();
    const touch = e.touches[0];
    moveAction(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!enabled) {
      setCurrentRect(null);
      setIsDrawing(false);
    }
  }, [enabled]);

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block w-full h-auto select-none rounded-lg overflow-hidden group touch-none ${enabled ? 'cursor-crosshair' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endAction}
      onMouseLeave={endAction}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={endAction}
    >
      <img 
        src={imageSrc} 
        alt="Preview" 
        className="block w-full h-auto max-h-[500px] object-contain pointer-events-none"
      />
      
      {enabled && !currentRect && !isDrawing && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none p-4 text-center">
          <span className="bg-black/60 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm border border-white/10">
            Arraste para selecionar a área
          </span>
        </div>
      )}

      {currentRect && (
        <div 
          className="absolute border-2 border-primary-500 bg-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.6)] z-10 pointer-events-none"
          style={{
            left: currentRect.x,
            top: currentRect.y,
            width: currentRect.w,
            height: currentRect.h
          }}
        >
           <div className="absolute -top-7 left-0 bg-primary-600 text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg whitespace-nowrap">
             Área Selecionada
           </div>
        </div>
      )}
    </div>
  );
};