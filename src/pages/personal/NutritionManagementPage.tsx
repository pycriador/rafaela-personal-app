import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { nutritionRepository } from '../../repositories/nutritionRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { NutritionPlan, Student } from '../../types';
import {
  Apple,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  X,
} from 'lucide-react';

export const NutritionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);

  // Read URL query params
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limitPerPage = Math.max(1, parseInt(searchParams.get('limit') || '4', 10));
  const currentSearch = searchParams.get('search') || '';
  const currentGoal = searchParams.get('goal') || 'all';
  const currentStatus = searchParams.get('status') || 'all';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    async function load() {
      const [allPlans, allStudents] = await Promise.all([
        nutritionRepository.getAll(),
        studentRepository.getAll(),
      ]);
      setPlans(allPlans);
      const map: Record<string, Student> = {};
      allStudents.forEach((s) => {
        map[s.id] = s;
      });
      setStudents(map);
      setLoading(false);
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

  // Unique nutritional goals available for filtering
  const availableGoals = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      if (p.goal) set.add(p.goal);
    });
    return Array.from(set);
  }, [plans]);

  // Filter plans based on search, goal, and student status
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const student = students[plan.studentId];
      const studentName = student?.name?.toLowerCase() || '';
      const studentEmail = student?.email?.toLowerCase() || '';
      const planGoal = plan.goal?.toLowerCase() || '';
      const query = currentSearch.toLowerCase().trim();

      // Search match (student name, email or plan goal)
      if (query && !studentName.includes(query) && !studentEmail.includes(query) && !planGoal.includes(query)) {
        return false;
      }

      // Goal match
      if (currentGoal !== 'all' && plan.goal !== currentGoal) {
        return false;
      }

      // Status match
      if (currentStatus !== 'all' && student?.status !== currentStatus) {
        return false;
      }

      return true;
    });
  }, [plans, students, currentSearch, currentGoal, currentStatus]);

  // Pagination calculation
  const totalItems = filteredPlans.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limitPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * limitPerPage;
  const endIndex = Math.min(startIndex + limitPerPage, totalItems);
  const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

  const hasActiveFilters = Boolean(currentSearch || (currentGoal && currentGoal !== 'all') || (currentStatus && currentStatus !== 'all'));

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams({ page: '1', limit: String(limitPerPage) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestão de Alimentação dos Alunos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-0.5">
            Orientações alimentares e opções de substituições inteligentes
          </p>
        </div>
      </div>

      {/* Main Unified Container (Estilo WorkoutBuilderPage) */}
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle>Planos Alimentares & Metas Calóricas</CardTitle>
          <p className="text-xs text-slate-500">
            Acompanhe o planejamento de refeições, metas nutricionais e histórico de cada aluno.
          </p>
        </CardHeader>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Input
            placeholder="Buscar por aluno, e-mail ou meta..."
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
            options={[
              { value: 'all', label: 'Todos os Objetivos' },
              ...availableGoals.map((g) => ({ value: g, label: g })),
            ]}
            value={currentGoal}
            onChange={(e) => updateParams({ goal: e.target.value, page: '1' })}
          />

          <Select
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'Ativo', label: 'Ativo' },
              { value: 'Pausado', label: 'Pausado' },
              { value: 'Atenção', label: 'Atenção' },
            ]}
            value={currentStatus}
            onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
          />
        </div>

        {/* Counter and Clear Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted pt-1">
          <span>
            Encontrados <strong className="text-slate-900 dark:text-white">{totalItems}</strong> de {plans.length} planos
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

        {/* Plans Grid */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : paginatedPlans.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Apple className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nenhum plano alimentar encontrado
              </p>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-md mx-auto">
                Tente ajustar os filtros de busca ou objetivo para visualizar outros alunos.
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={handleClearFilters} className="mt-2">
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedPlans.map((plan) => {
              const student = students[plan.studentId];
              return (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between group gap-4"
                >
                  <div>
                    {/* Header with Student Info and Calorie Goal */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border/60">
                      <div className="flex items-center gap-3">
                        <img
                          src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={student?.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-dark-border shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {student?.name || 'Aluno'}
                            </h3>
                            {student?.status && (
                              <Badge
                                variant={student.status === 'Ativo' ? 'success' : student.status === 'Pausado' ? 'warning' : 'neutral'}
                                size="sm"
                              >
                                {student.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {plan.goal}
                          </p>
                        </div>
                      </div>
                      <Badge variant="brand" size="sm">
                        {plan.dailyCalories} kcal
                      </Badge>
                    </div>

                    {/* Meals List */}
                    <div className="mt-3.5 space-y-2">
                      {plan.meals.slice(0, 3).map((meal) => (
                        <div
                          key={meal.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/60 border border-slate-100 dark:border-dark-border/40 text-xs"
                        >
                          <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-0.5">
                            <span>{meal.name}</span>
                            <span className="text-emerald-500 font-mono font-bold">{meal.time}</span>
                          </div>
                          <p className="text-slate-500 dark:text-dark-muted text-[11px] truncate">
                            {meal.items && meal.items.length > 0
                              ? meal.items.map((it) => it.name).join(', ')
                              : 'Nenhum alimento cadastrado'}
                          </p>
                        </div>
                      ))}
                      {plan.meals.length > 3 && (
                        <p className="text-[11px] text-center text-slate-400">
                          + {plan.meals.length - 3} refeições adicionais cadastradas
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Atualizado em {plan.updatedAt}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() => navigate(`/personal/students/${plan.studentId}?tab=alimentacao`)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Gerenciar Alimentação
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* URL-Synchronized Pagination Controls */}
        {!loading && (
          <div className="pt-4 border-t border-slate-100 dark:border-dark-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-dark-muted text-center sm:text-left">
              Exibindo{' '}
              <strong className="text-slate-900 dark:text-white">
                {totalItems > 0 ? startIndex + 1 : 0}
              </strong>{' '}
              a{' '}
              <strong className="text-slate-900 dark:text-white">
                {endIndex}
              </strong>{' '}
              de <strong className="text-slate-900 dark:text-white">{totalItems}</strong> planos
              <span className="ml-1 text-slate-400">
                (Página {safePage} de {totalPages})
              </span>
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
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Anterior
              </Button>

              {/* Direct Page Numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateParams({ page: String(p) })}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      safePage === p
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs font-semibold'
                        : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: String(safePage + 1) })}
                disabled={safePage >= totalPages}
                rightIcon={<ChevronRight className="w-4 h-4" />}
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
