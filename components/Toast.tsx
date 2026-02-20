import React, { useState, useEffect, useCallback } from 'react';
import { IconCheckCircle, IconX } from './Icons';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  const colors: Record<ToastType, string> = {
    success: 'border-green-800/40 text-green-400',
    error: 'border-red-800/40 text-red-400',
    info: 'border-zinc-700 text-zinc-300',
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[300] max-w-sm bg-zinc-900 border ${colors[type]} rounded-lg px-4 py-3 shadow-md flex items-center gap-3 text-sm transition-opacity duration-200 ${visible ? 'opacity-100 animate-toast-in' : 'opacity-0'}`}
    >
      {type === 'success' && <IconCheckCircle />}
      <span className="flex-1">{message}</span>
      <button onClick={dismiss} className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Fechar notificação">
        <IconX />
      </button>
    </div>
  );
};
