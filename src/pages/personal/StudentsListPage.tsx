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
  X,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { studentRepository } from '../../repositories/studentRepository';
import { Student, StudentGoal } from '../../types';

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Read URL query params
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limitPerPage = Math.max(1, parseInt(searchParams.get('limit') || '6', 10));
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
    setSearchParams(new URLSearchParams({ page: '1', limit: String(limitPerPage) }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestão de Alunos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-0.5">
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

      {/* Filters Bar (Section 7) */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Limpar
              </Button>
            )}
            <span className="text-xs text-slate-400 font-mono">
              {totalItems} {totalItems === 1 ? 'aluno' : 'alunos'}
            </span>
          </div>
        </div>
      </Card>

      {/* Students Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : paginatedStudents.length === 0 ? (
        <Card className="py-12 text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">Nenhum aluno encontrado</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Tente ajustar os filtros ou buscar por outro termo.</p>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedStudents.map((student) => (
            <Card
              key={student.id}
              className="hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer p-5 flex flex-col justify-between group"
              onClick={() => navigate(`/personal/students/${student.id}`)}
            >
              <div>
                {/* Header card with avatar and status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-dark-border group-hover:ring-emerald-500 transition-all shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {student.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-dark-muted truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>
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

                {/* Goals badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {student.goals.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    >
                      {g}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400">
                    {student.level}
                  </span>
                </div>

                {/* Details info */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-dark-muted bg-slate-50 dark:bg-dark-cardElevated/50 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Frequência:
                    </span>
                    <strong className="text-slate-900 dark:text-white">
                      {student.availableDays.length}x ({student.availableDays.join(', ')})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      Última atividade:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {student.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-500 font-mono">
                    {student.adherencePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">adesão</span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 flex items-center gap-1 transition-colors">
                  Ver Perfil
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* URL-Synchronized Pagination Controls */}
      {!loading && totalPages > 1 && (
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500 dark:text-dark-muted font-mono">
            Exibindo <strong>{startIndex + 1}</strong> a <strong>{endIndex}</strong> de{' '}
            <strong>{totalItems}</strong> alunos
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => updateParams({ page: String(safePage - 1) })}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateParams({ page: String(p) })}
                className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                  p === safePage
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-cardElevated'
                }`}
              >
                {p}
              </button>
            ))}

            <Button
              variant="secondary"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => updateParams({ page: String(safePage + 1) })}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Próximo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
