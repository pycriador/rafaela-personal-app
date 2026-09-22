import React, { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fullscreen';
  showCloseButton?: boolean;
  allowFullscreenToggle?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  allowFullscreenToggle,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Enable fullscreen toggle by default on medium to large modals
  const canToggleFullscreen =
    allowFullscreenToggle ?? (size === 'lg' || size === 'xl' || size === '2xl' || size === 'full' || size === 'fullscreen');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset maximized state when closed or opened
  useEffect(() => {
    if (!isOpen) {
      setIsMaximized(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md w-full',
    md: 'max-w-xl sm:max-w-2xl w-full',
    lg: 'max-w-3xl sm:max-w-4xl w-full',
    xl: 'max-w-5xl sm:max-w-6xl w-full',
    '2xl': 'max-w-7xl w-[94vw]',
    full: 'w-[96vw] max-w-[1550px] h-[93vh] max-h-[93vh]',
    fullscreen: 'w-full sm:w-[98vw] max-w-[1780px] h-full sm:h-[96vh] max-h-[96vh] sm:rounded-3xl',
  };

  const isActuallyFullscreen = isMaximized || size === 'fullscreen';

  const containerClasses = isActuallyFullscreen
    ? 'w-full sm:w-[98vw] max-w-[1800px] h-full sm:h-[96vh] max-h-[96vh] sm:rounded-3xl'
    : `${sizeClasses[size] || sizeClasses.md} max-h-[92vh] rounded-t-3xl sm:rounded-2xl`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 overflow-y-auto no-scrollbar">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative ${containerClasses} bg-white dark:bg-dark-card border-t sm:border border-slate-200 dark:border-dark-border shadow-2xl z-10 flex flex-col transition-all duration-200 overflow-hidden animate-slide-up sm:animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton || canToggleFullscreen) && (
          <div className="flex items-start justify-between px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-dark-border/60 shrink-0 bg-white/50 dark:bg-dark-card/50 backdrop-blur-xs">
            <div className="pr-4">
              {title && (
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 -mr-1 -mt-1">
              {canToggleFullscreen && (
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={isActuallyFullscreen ? 'Restaurar tamanho' : 'Modo tela cheia'}
                  aria-label={isActuallyFullscreen ? 'Restaurar tamanho' : 'Modo tela cheia'}
                >
                  {isActuallyFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              )}

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
};
