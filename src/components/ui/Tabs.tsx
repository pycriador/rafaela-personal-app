import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'slate';
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  extraRightAction?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  extraRightAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll capability
  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, tabs]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    // Small timeout to allow DOM to finish rendering
    const timer = setTimeout(checkScroll, 300);
    return () => clearTimeout(timer);
  }, [activeTab, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(160, el.clientWidth * 0.6);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className={`relative flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-dark-cardElevated/80 rounded-xl border border-slate-200/60 dark:border-white/[0.06] ${className}`}>
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-1 z-10 p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center"
          title="Rolar para a esquerda"
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Gradient Mask Left */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-100/90 dark:from-dark-cardElevated/90 to-transparent pointer-events-none z-5 rounded-l-xl" />
      )}

      {/* Scrollable Tabs Ribbon */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full px-0.5 py-0.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-active={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#1a202c] text-slate-900 dark:text-slate-100 shadow-2xs font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.04]'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : tab.badgeColor === 'amber'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Gradient Mask Right */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 dark:from-dark-cardElevated/90 to-transparent pointer-events-none z-5 rounded-r-2xl" />
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-1 z-10 p-1.5 rounded-xl bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center"
          title="Rolar para a direita"
          aria-label="Rolar para a direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Extra Action (e.g. Dropdown / Menu) */}
      {extraRightAction && (
        <div className="shrink-0 pl-1 border-l border-slate-200 dark:border-slate-700">
          {extraRightAction}
        </div>
      )}
    </div>
  );
};
