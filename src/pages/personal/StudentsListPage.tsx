import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Calendar,
  Activity,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  AlertTriangle,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { studentRepository } from '../../repositories/studentRepository';
import { Student, StudentGoal } from '../../types';

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Screen-responsive default page size:
  // - default: 6 items (fits 1, 2, and 3 columns perfectly)
  // - on ultra-wide screens (>= 1536px / 2xl with 4 columns): 8 items (2 rows of 4)
  const getResponsiveDefaultLimit = () => {
    if (typeof window === 'undefined') return 6;
    const width = window.innerWidth;
    if (width >= 1536) return 8;
    return 6;
  };

  const [screenLimit, setScreenLimit] = useState<number>(getResponsiveDefaultLimit);

  useEffect(() => {
    const handleResize = () => {
      setScreenLimit(getResponsiveDefaultLimit());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Read URL query params
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const rawLimitParam = searchParams.get('limit');
  const limitPerPage = rawLimitParam && rawLimitParam !== 'auto'
    ? Math.max(1, parseInt(rawLimitParam, 10))
    : screenLimit;

  const currentSearch = searchParams.get('search') || '';
  const currentGoal = searchParams.get('goal') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentFreq = searchParams.get('frequency') || 'all';
  const currentPlanFilter = searchParams.get('planFilter') || 'all';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentRepository.getAll();
        setAllStudents(data);
      } catch (err) {
        console.error('Erro ao carregar alunos:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Calculate plan status and expiration
  const getPlanStatus = (student: Student) => {
    if (student.hasActivePlan === false) {
      return { status: 'no_plan' as const, label: 'Sem Ficha Ativa' };
    }
    if (!student.planExpiresAt) {
      return { status: 'active' as const, label: 'Ficha Ativa' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(student.planExpiresAt);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired' as const, label: `Vencido há ${Math.abs(diffDays)}d`, days: diffDays };
    }
    if (diffDays <= 7) {
      return { status: 'expiring_soon' as const, label: `Vence em ${diffDays}d`, days: diffDays };
    }
    return { status: 'active' as const, label: `Vence em ${diffDays}d`, days: diffDays };
  };

  // Retention filter counts
  const filterCounts = useMemo(() => {
    let noPlan = 0;
    let expiringSoon = 0;
    let expired = 0;
    let lowAdherence = 0;

    allStudents.forEach((st) => {
      const p = getPlanStatus(st);
      if (p.status === 'no_plan') noPlan++;
      if (p.status === 'expiring_soon') expiringSoon++;
      if (p.status === 'expired') expired++;
      if (st.adherencePercentage < 80) lowAdherence++;
    });

    return { noPlan, expiringSoon, expired, lowAdherence };
  }, [allStudents]);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  // 1-Click WhatsApp helper for plan renewal / encouragement
  const openWhatsAppRenewal = (e: React.MouseEvent, student: Student, planStatus: ReturnType<typeof getPlanStatus>) => {
    e.stopPropagation();
    const cleanPhone = student.phone.replace(/\D/g, '');
    let msg = `Olá, ${student.name}! Rafaela aqui. `;
    if (planStatus.status === 'no_plan') {
      msg += `Notei que você está sem ficha de treino ativa. Vamos montar seu novo ciclo de treinos para atingir seus objetivos? 💪`;
    } else if (planStatus.status === 'expired') {
      msg += `Sua ficha de treino venceu. Vamos agendar a renovação e ajuste de cargas para continuar seu progresso? 🏋️`;
    } else if (planStatus.status === 'expiring_soon') {
      msg += `Sua ficha de treino atual está próxima do vencimento (${planStatus.label}). Que tal já alinharmos os ajustes para a nova fase? 🎯`;
    } else if (student.adherencePercentage < 80) {
      msg += `Passando para acompanhar seus treinos desta semana! Está precisando de algum ajuste na rotina? 🚀`;
    } else {
      msg += `Tudo bem por aí? Passando para checar como estão os treinos e sua evolução! 🌟`;
    }
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Debounce search input to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateParams({ search: searchInput.trim() ? searchInput.trim() : null, page: '1' });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Client-side filtering based on URL parameters
  const filteredStudents = useMemo(() => {
    return allStudents.filter((st) => {
      const q = currentSearch.toLowerCase().trim();
      if (q) {
        const nameMatch = st.name.toLowerCase().includes(q);
        const emailMatch = st.email.toLowerCase().includes(q);
        const goalMatch = st.goals.some((g) => g.toLowerCase().includes(q));
        if (!nameMatch && !emailMatch && !goalMatch) return false;
      }

      if (currentGoal !== 'all' && !st.goals.includes(currentGoal as StudentGoal)) {
        return false;
      }

      if (currentStatus !== 'all' && st.status !== currentStatus) {
        return false;
      }

      if (currentFreq !== 'all') {
        const freqNum = parseInt(currentFreq, 10);
        if (st.availableDays.length !== freqNum) return false;
      }

      if (currentPlanFilter !== 'all') {
        const planStatus = getPlanStatus(st);
        if (currentPlanFilter === 'no_plan' && planStatus.status !== 'no_plan') return false;
        if (currentPlanFilter === 'expiring_soon' && planStatus.status !== 'expiring_soon') return false;
        if (currentPlanFilter === 'expired' && planStatus.status !== 'expired') return false;
        if (currentPlanFilter === 'low_adherence' && st.adherencePercentage >= 80) return false;
      }

      return true;
    });
  }, [allStudents, currentSearch, currentGoal, currentStatus, currentFreq, currentPlanFilter]);

  // Pagination calculation
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limitPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * limitPerPage;
  const endIndex = Math.min(startIndex + limitPerPage, totalItems);
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const hasActiveFilters = Boolean(
    currentSearch ||
    (currentGoal && currentGoal !== 'all') ||
    (currentStatus && currentStatus !== 'all') ||
    (currentFreq && currentFreq !== 'all') ||
    (currentPlanFilter && currentPlanFilter !== 'all')
  );

  const handleClearFilters = () => {
    setSearchInput('');
    const next = new URLSearchParams({ page: '1' });
    if (rawLimitParam && rawLimitParam !== 'auto') {
      next.set('limit', rawLimitParam);
    }
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Gestão de Alunos
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-0.5 font-normal">
            Acompanhe o status, metas, rotina de treinos e frequência dos alunos
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/personal/students/new')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Cadastrar Aluno
        </Button>
      </div>

      {/* Main Unified Container (Estilo WorkoutBuilderPage) */}
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle>Alunos Matriculados & Frequência</CardTitle>
          <p className="text-xs text-slate-500">
            Filtre por objetivo, status, vigência da ficha ou frequência para gerenciar a retenção de alunos.
          </p>
        </CardHeader>

        {/* Retention & Expiration Quick Filter Tabs (Items 8 & 9) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            type="button"
            onClick={() => updateParams({ planFilter: null, page: '1' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPlanFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Todos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/20">
              {allStudents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateParams({ planFilter: 'no_plan', page: '1' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPlanFilter === 'no_plan'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Sem Treino Ativo</span>
            {filterCounts.noPlan > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-500/20 text-slate-600 dark:text-slate-300 font-bold">
                {filterCounts.noPlan}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateParams({ planFilter: 'expiring_soon', page: '1' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPlanFilter === 'expiring_soon'
                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Vencendo (&lt; 7 dias)</span>
            {filterCounts.expiringSoon > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 font-bold">
                {filterCounts.expiringSoon}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateParams({ planFilter: 'expired', page: '1' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPlanFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Planos Vencidos</span>
            {filterCounts.expired > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/30 font-bold">
                {filterCounts.expired}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateParams({ planFilter: 'low_adherence', page: '1' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPlanFilter === 'low_adherence'
                ? 'bg-amber-700 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3 text-amber-500" />
            <span>Baixa Adesão (&lt;80%)</span>
            {filterCounts.lowAdherence > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                {filterCounts.lowAdherence}
              </span>
            )}
          </button>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <Input
            placeholder="Buscar por nome, e-mail..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParams({ search: null, page: '1' });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />

          <Select
            value={currentGoal}
            onChange={(e) => updateParams({ goal: e.target.value, page: '1' })}
            options={[
              { value: 'all', label: 'Todos os Objetivos' },
              { value: 'Hipertrofia', label: 'Hipertrofia' },
              { value: 'Emagrecimento', label: 'Emagrecimento' },
              { value: 'Condicionamento', label: 'Condicionamento' },
              { value: 'Força', label: 'Força' },
              { value: 'Saúde', label: 'Saúde' },
            ]}
          />

          <Select
            value={currentStatus}
            onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'Ativo', label: 'Ativo' },
              { value: 'Atenção', label: 'Precisa de Atenção' },
              { value: 'Pausado', label: 'Pausado' },
              { value: 'Arquivado', label: 'Arquivado' },
            ]}
          />

          <Select
            value={currentFreq}
            onChange={(e) => updateParams({ frequency: e.target.value, page: '1' })}
            options={[
              { value: 'all', label: 'Todas as Frequências' },
              { value: '2', label: '2 dias por semana' },
              { value: '3', label: '3 dias por semana' },
              { value: '4', label: '4 dias por semana' },
              { value: '5', label: '5 dias por semana' },
            ]}
          />
        </div>

        {/* Counter and Clear Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted pt-1">
          <span>
            Encontrados <strong className="text-slate-900 dark:text-white">{totalItems}</strong> de {allStudents.length} alunos
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-rose-500 hover:text-rose-600 h-7 px-2"
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nenhum aluno encontrado
              </p>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-md mx-auto">
                Tente ajustar os filtros de busca, objetivo ou frequência.
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={handleClearFilters} className="mt-2">
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {paginatedStudents.map((student) => {
              const planStatus = getPlanStatus(student);
              return (
                <div
                  key={student.id}
                  onClick={() => navigate(`/personal/students/${student.userId || student.id}`)}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-dark-card hover:border-slate-300 dark:hover:border-white/[0.16] shadow-xs cursor-pointer transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={student.name}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200/80 dark:ring-white/[0.08] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {student.name}
                        </h4>
                        <Badge
                          variant={
                            student.status === 'Ativo'
                              ? 'success'
                              : student.status === 'Pausado'
                              ? 'warning'
                              : student.status === 'Atenção'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {student.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-dark-muted truncate mt-0.5">
                        {student.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 font-medium" title="ID do Usuário no Banco de Dados">
                          UID: {student.userId || student.id}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-dark-muted font-normal truncate">
                          {student.level} • {student.goals.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Registered training days & activity box */}
                  <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-dark-cardElevated/40 border border-slate-200/60 dark:border-white/[0.06] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Dias Cadastrados ({student.availableDays.length}):</span>
                      </div>
                      <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 text-xs">
                        {student.adherencePercentage}% adesão
                      </span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium block truncate">
                      {student.availableDays.length > 0 ? student.availableDays.join(', ') : 'Nenhum dia cadastrado'}
                    </span>
                  </div>

                  {/* Retention Alert & 1-Click WhatsApp Renewal (Items 8 & 9) */}
                  {planStatus.status !== 'active' ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        planStatus.status === 'expired'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                          : planStatus.status === 'expiring_soon'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold truncate">{planStatus.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => openWhatsAppRenewal(e, student, planStatus)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center gap-1 transition-colors shrink-0 shadow-2xs cursor-pointer"
                        title="Abrir WhatsApp para renovação da ficha"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Renovar</span>
                      </button>
                    </div>
                  ) : student.adherencePercentage < 80 ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Activity className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span className="font-semibold truncate">Adesão Baixa ({student.adherencePercentage}%)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => openWhatsAppRenewal(e, student, planStatus)}
                        className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                        title="Enviar mensagem de incentivo no WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Incentivar</span>
                      </button>
                    </div>
                  ) : null}

                  {/* Card Footer */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 dark:text-dark-muted">
                        Atividade: <strong className="text-slate-600 dark:text-slate-300 font-medium">{student.lastActive}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => openWhatsAppRenewal(e, student, planStatus)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                        title="Contatar via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
                      Ver Perfil
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* URL Pagination Controls (Estilo WorkoutBuilderPage / ExercisesPage) */}
        {!loading && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-500 dark:text-dark-muted text-center sm:text-left">
              <div>
                Exibindo{' '}
                <strong className="text-slate-900 dark:text-white font-medium">
                  {totalItems > 0 ? startIndex + 1 : 0}
                </strong>{' '}
                a{' '}
                <strong className="text-slate-900 dark:text-white font-medium">
                  {endIndex}
                </strong>{' '}
                de <strong className="text-slate-900 dark:text-white font-medium">{totalItems}</strong> alunos
                <span className="ml-1 text-slate-400">
                  (Página {safePage} de {totalPages})
                </span>
              </div>

              {/* Items per Page Selector */}
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="text-[11px] text-slate-400 font-medium">Exibir:</span>
                <select
                  value={rawLimitParam || 'auto'}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateParams({ limit: val === 'auto' ? null : val, page: '1' });
                  }}
                  className="text-xs font-medium bg-white dark:bg-dark-card border border-slate-200 dark:border-white/[0.1] rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="auto">Tela ({screenLimit} por página)</option>
                  <option value="6">6 por página (Padrão)</option>
                  <option value="8">8 por página</option>
                  <option value="9">9 por página</option>
                  <option value="12">12 por página</option>
                  <option value="18">18 por página</option>
                  <option value="24">24 por página</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: '1' })}
                disabled={safePage <= 1}
                className="px-2"
                title="Primeira Página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: String(safePage - 1) })}
                disabled={safePage <= 1}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Anterior
              </Button>

              {/* Direct Page Numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 7) {
                    if (
                      p !== 1 &&
                      p !== totalPages &&
                      Math.abs(p - safePage) > 1
                    ) {
                      if (p === 2 || p === totalPages - 1) {
                        return (
                          <span key={p} className="text-xs text-slate-400 px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold font-mono transition-all ${
                        safePage === p
                          ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                          : 'bg-slate-100/80 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.1]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: String(safePage + 1) })}
                disabled={safePage >= totalPages}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Próxima
              </Button>

              {/* Last Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: String(totalPages) })}
                disabled={safePage >= totalPages}
                className="px-2"
                title="Última Página"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
