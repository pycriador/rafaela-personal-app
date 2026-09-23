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

      return true;
    });
  }, [allStudents, currentSearch, currentGoal, currentStatus, currentFreq]);

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
    (currentFreq && currentFreq !== 'all')
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
            Filtre por objetivo, status ou frequência semanal para acessar prontuários e gerenciar planos.
          </p>
        </CardHeader>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
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
            {paginatedStudents.map((student) => (
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

                {/* Card Footer */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-dark-muted">
                    Atividade: <strong className="text-slate-600 dark:text-slate-300 font-medium">{student.lastActive}</strong>
                  </span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
                    Ver Perfil
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
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
