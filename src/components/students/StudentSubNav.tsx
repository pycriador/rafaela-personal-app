import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Users,
  Dumbbell,
  MessageSquare,
  ClipboardList,
  Apple,
  TrendingUp,
  History,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export type StudentTabId =
  | 'resumo'
  | 'treinos'
  | 'conversa'
  | 'anamnese'
  | 'alimentacao'
  | 'evolucao'
  | 'historico'
  | 'ia'
  | 'configuracoes';

export interface StudentSubNavProps {
  activeTab: string;
  onTabChange: (tabId: StudentTabId) => void;
  workoutDaysCount?: number;
  aiPendingProposalsCount?: number;
  anamnesisPendingCount?: number;
  sessionsCount?: number;
  unreadMessagesCount?: number;
}

interface TabDef {
  id: StudentTabId;
  label: string;
  shortLabel: string;
  category: 'treino' | 'saude' | 'gestao';
  categoryTitle: string;
  description: string;
  icon: (className?: string) => React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  highlight?: boolean;
}

export const StudentSubNav: React.FC<StudentSubNavProps> = ({
  activeTab,
  onTabChange,
  workoutDaysCount = 0,
  aiPendingProposalsCount = 0,
  anamnesisPendingCount = 0,
  sessionsCount = 0,
  unreadMessagesCount = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isAllTabsMenuOpen, setIsAllTabsMenuOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'treino' | 'saude' | 'gestao'>('all');

  // Normalize legacy 'chat' to 'conversa'
  const normalizedActiveTab = (activeTab === 'chat' ? 'conversa' : activeTab) as StudentTabId;

  // Complete definition of the 9 tabs with categories, descriptions and badges
  const allTabs: TabDef[] = [
    // Pillar 1: Treino & Acompanhamento
    {
      id: 'resumo',
      label: 'Resumo Geral',
      shortLabel: 'Resumo',
      category: 'treino',
      categoryTitle: 'Treino & Acompanhamento',
      description: 'Visão geral, frequência, taxa de adesão e métricas do aluno',
      icon: (cls = 'w-4 h-4') => <Users className={cls} />,
    },
    {
      id: 'treinos',
      label: 'Fichas de Treino',
      shortLabel: 'Treinos',
      category: 'treino',
      categoryTitle: 'Treino & Acompanhamento',
      description: 'Prescrição dos treinos da semana, exercícios, séries e cargas',
      icon: (cls = 'w-4 h-4') => <Dumbbell className={cls} />,
      badge: workoutDaysCount > 0 ? `${workoutDaysCount}d` : undefined,
      badgeVariant: 'primary',
    },
    {
      id: 'conversa',
      label: 'Bate-Papo',
      shortLabel: 'Conversa',
      category: 'treino',
      categoryTitle: 'Treino & Acompanhamento',
      description: 'Mensagens diretas, orientações em tempo real e feedbacks',
      icon: (cls = 'w-4 h-4') => <MessageSquare className={cls} />,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} nova(s)` : undefined,
      badgeVariant: 'warning',
    },
    {
      id: 'evolucao',
      label: 'Evolução de Cargas',
      shortLabel: 'Evolução',
      category: 'treino',
      categoryTitle: 'Treino & Acompanhamento',
      description: 'Progressão de cargas e gráficos de sobrecarga por exercício',
      icon: (cls = 'w-4 h-4') => <TrendingUp className={cls} />,
    },

    // Pillar 2: Saúde & Hábitos
    {
      id: 'anamnese',
      label: 'Anamnese & Avaliações',
      shortLabel: 'Anamnese',
      category: 'saude',
      categoryTitle: 'Saúde & Hábitos',
      description: 'Formulários aplicados, respostas de saúde e questionários',
      icon: (cls = 'w-4 h-4') => <ClipboardList className={cls} />,
      badge: anamnesisPendingCount > 0 ? `${anamnesisPendingCount} pendente` : undefined,
      badgeVariant: 'warning',
    },
    {
      id: 'alimentacao',
      label: 'Plano Alimentar',
      shortLabel: 'Alimentação',
      category: 'saude',
      categoryTitle: 'Saúde & Hábitos',
      description: 'Cardápio nutricional, refeições e orientações alimentares',
      icon: (cls = 'w-4 h-4') => <Apple className={cls} />,
    },

    // Pillar 3: Gestão & Inteligência
    {
      id: 'historico',
      label: 'Histórico & Sessões',
      shortLabel: 'Histórico',
      category: 'gestao',
      categoryTitle: 'Gestão & Inteligência',
      description: 'Auditoria de treinos executados, feedbacks e RPE',
      icon: (cls = 'w-4 h-4') => <History className={cls} />,
      badge: sessionsCount > 0 ? `${sessionsCount}` : undefined,
      badgeVariant: 'neutral',
    },
    {
      id: 'ia',
      label: 'AI Copilot',
      shortLabel: 'IA Copilot',
      category: 'gestao',
      categoryTitle: 'Gestão & Inteligência',
      description: 'Copiloto de inteligência artificial para propostas de treino',
      icon: (cls = 'w-4 h-4') => <Sparkles className={`${cls} text-amber-500`} />,
      badge: aiPendingProposalsCount > 0 ? `${aiPendingProposalsCount} nova(s)` : undefined,
      badgeVariant: 'warning',
      highlight: aiPendingProposalsCount > 0,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      shortLabel: 'Configurações',
      category: 'gestao',
      categoryTitle: 'Gestão & Inteligência',
      description: 'Dados cadastrais, preferências de treino e consentimento LGPD',
      icon: (cls = 'w-4 h-4') => <Settings className={cls} />,
    },
  ];

  // Active tab metadata
  const currentTabDef = allTabs.find((t) => t.id === normalizedActiveTab) || allTabs[0];

  // Filter tabs if a category pill is selected
  const visibleTabs = selectedCategoryFilter === 'all'
    ? allTabs
    : allTabs.filter((t) => t.category === selectedCategoryFilter);

  // Check scroll ability
  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, visibleTabs]);

  // Auto-scroll to active tab whenever it changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    const timer = setTimeout(checkScroll, 200);
    return () => clearTimeout(timer);
  }, [normalizedActiveTab, checkScroll]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(180, el.clientWidth * 0.55);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 250);
  };

  const handleSelectTab = (tabId: StudentTabId) => {
    onTabChange(tabId);
    setIsAllTabsMenuOpen(false);
  };

  // Pillars for categorized grid
  const pillars = [
    {
      id: 'treino',
      name: 'Treino & Acompanhamento',
      badge: `${allTabs.filter((t) => t.category === 'treino').length} abas`,
      tabs: allTabs.filter((t) => t.category === 'treino'),
    },
    {
      id: 'saude',
      name: 'Saúde & Hábitos',
      badge: `${allTabs.filter((t) => t.category === 'saude').length} abas`,
      tabs: allTabs.filter((t) => t.category === 'saude'),
    },
    {
      id: 'gestao',
      name: 'Gestão & Inteligência',
      badge: `${allTabs.filter((t) => t.category === 'gestao').length} abas`,
      tabs: allTabs.filter((t) => t.category === 'gestao'),
    },
  ];

  return (
    <div className="space-y-2">
      {/* MOBILE COMPACT HEADER (Visible on small screens < md) */}
      <div className="md:hidden p-3 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              {currentTabDef.icon('w-5 h-5')}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                {currentTabDef.categoryTitle}
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {currentTabDef.label}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAllTabsMenuOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-cardElevated hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-slate-200/80 dark:border-dark-border/80 cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ver Abas (9)</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR (Responsive on all viewports) */}
      <div className="relative flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-dark-cardElevated/90 rounded-2xl border border-slate-200/80 dark:border-dark-border/80 shadow-xs">
        {/* Left Arrow for Overflow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-1.5 z-10 p-1.5 rounded-xl bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Rolar para a esquerda"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Gradient Left */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 dark:from-dark-cardElevated to-transparent pointer-events-none z-5 rounded-l-2xl" />
        )}

        {/* Scrollable Tabs Track */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full px-1 py-0.5"
        >
          {visibleTabs.map((tab) => {
            const isActive = normalizedActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-active={isActive}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-slate-200/80 dark:ring-emerald-400/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50'
                } ${tab.highlight && !isActive ? 'ring-1 ring-amber-500/40 bg-amber-500/5' : ''}`}
                title={tab.description}
              >
                <span className="shrink-0">{tab.icon('w-4 h-4')}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>

                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        : tab.badgeVariant === 'warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        : tab.badgeVariant === 'primary'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Gradient Right */}
        {canScrollRight && (
          <div className="absolute right-12 sm:right-32 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 dark:from-dark-cardElevated to-transparent pointer-events-none z-5" />
        )}

        {/* Right Arrow for Overflow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-12 sm:right-32 z-10 p-1.5 rounded-xl bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Rolar para a direita"
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* "Todas as Abas" Popover Button (Fixed right anchor) */}
        <div className="shrink-0 pl-1 border-l border-slate-200 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setIsAllTabsMenuOpen(!isAllTabsMenuOpen)}
            className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isAllTabsMenuOpen
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-border'
            }`}
            title="Ver mapa completo com as 9 abas organizadas por categoria"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Todas as Abas (9)</span>
            <span className="sm:hidden">Menu</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAllTabsMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* CATEGORIZED FULL-SCREEN / POPOVER MENU ("MAPA COMPLETO DAS ABAS") */}
      {isAllTabsMenuOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xl space-y-4 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                  Navegação do Aluno
                </span>
                <span className="text-xs text-slate-500">• 9 Módulos Clínicos & Operacionais</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                Mapa das Abas & Módulos
              </h4>
            </div>

            {/* Quick Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtrar:
              </span>
              {[
                { id: 'all', label: 'Todas' },
                { id: 'treino', label: 'Treino' },
                { id: 'saude', label: 'Saúde' },
                { id: 'gestao', label: 'Gestão/IA' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(f.id as any)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === f.id
                      ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-white'
                      : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsAllTabsMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white ml-2"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars
              .filter((p) => selectedCategoryFilter === 'all' || selectedCategoryFilter === p.id)
              .map((pillar) => (
                <div
                  key={pillar.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-dark-cardElevated/40 border border-slate-200/60 dark:border-dark-border/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {pillar.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {pillar.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {pillar.tabs.map((tab) => {
                      const isActive = normalizedActiveTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleSelectTab(tab.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 group ${
                            isActive
                              ? 'bg-white dark:bg-emerald-500/20 text-slate-900 dark:text-white border border-emerald-500/40 shadow-xs'
                              : 'hover:bg-white dark:hover:bg-dark-card text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-dark-border'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors ${
                              isActive
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500'
                            }`}
                          >
                            {tab.icon('w-3.5 h-3.5')}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isActive ? 'text-emerald-600 dark:text-emerald-300' : ''
                                }`}
                              >
                                {tab.label}
                              </span>
                              {tab.badge !== undefined && (
                                <span className="px-1.5 py-0.2 text-[9px] rounded-full font-bold bg-amber-500/20 text-amber-500 shrink-0">
                                  {tab.badge}
                                </span>
                              )}
                              {isActive && (
                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {tab.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
