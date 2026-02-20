import React, { useState, useEffect, useRef } from 'react';
import { IconArrowDown, IconCheckCircle, IconX } from '../Icons';

export interface MultiSelectOption {
  value: string;
  label: string;
  category?: string;
  icon?: React.ComponentType;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  single?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  single = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (single) {
      onChange(optionValue);
      setIsOpen(false);
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    }
  };

  const isSelected = (optionValue: string) => {
    if (single) return value === optionValue;
    return Array.isArray(value) && value.includes(optionValue);
  };

  const selectedLabels = () => {
    if (single) {
      const opt = options.find(o => o.value === value);
      return opt ? opt.label : null;
    }
    const currentValues = Array.isArray(value) ? value : [];
    return options.filter(o => currentValues.includes(o.value)).map(o => o.label);
  };

  const displayValue = selectedLabels();

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#111113] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:border-zinc-700 focus:ring-2 focus:ring-primary-500/40 transition-all shadow-sm"
      >
        <div className="flex flex-wrap gap-1 items-center truncate max-w-[90%]">
          {!displayValue || (Array.isArray(displayValue) && displayValue.length === 0) ? (
            <span className="text-zinc-500">{placeholder}</span>
          ) : single ? (
             <span className="truncate">{displayValue}</span>
          ) : (
             <div className="flex flex-wrap gap-1">
               {(displayValue as string[]).map((label, i) => (
                  <span key={i} className="bg-zinc-800 text-xs px-1.5 py-0.5 rounded text-zinc-300 border border-zinc-700 truncate max-w-[100px]">
                    {label}
                  </span>
               ))}
             </div>
          )}
        </div>
        <IconArrowDown />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-[#111113] border border-zinc-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-in p-1">
          {options.length === 0 ? (
            <div className="p-3 text-center text-zinc-500 text-xs">Nenhuma opção encontrada</div>
          ) : (
            <div className="space-y-0.5">
              {options.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                      selected 
                      ? 'bg-primary-600/10 text-primary-400' 
                      : 'text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="flex flex-col">
                        <span>{option.label}</span>
                        {option.category && <span className="text-[10px] text-zinc-500 uppercase font-bold">{option.category}</span>}
                    </span>
                    {selected && <IconCheckCircle />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
