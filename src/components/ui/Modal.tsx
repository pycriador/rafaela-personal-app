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
    '2xl': 'max-w-7xl w-full',
    full: 'w-full max-w-[1550px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-2.5rem)]',
    fullscreen: 'w-full max-w-[1780px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-2.5rem)]',
  };

  const isActuallyFullscreen = isMaximized || size === 'fullscreen';

  const containerClasses = isActuallyFullscreen
    ? 'w-full max-w-[1780px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-2.5rem)] rounded-2xl sm:rounded-3xl'
    : `${sizeClasses[size] || sizeClasses.md} max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-2.5rem)] rounded-2xl sm:rounded-3xl`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-5 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative ${containerClasses} bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] shadow-2xl z-10 flex flex-col transition-all duration-150 overflow-hidden animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton || canToggleFullscreen) && (
          <div className="flex items-start justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md">
            <div className="pr-4">
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 -mr-1 -mt-0.5">
              {canToggleFullscreen && (
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
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
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </div>
  );
};
