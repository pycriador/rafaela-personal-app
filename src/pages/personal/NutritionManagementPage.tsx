import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { nutritionRepository } from '../../repositories/nutritionRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { NutritionPlan, Student } from '../../types';
import {
  Apple,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
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
            Orientações alimentares demonstrativas e opções de substituições inteligentes
          </p>
        </div>
      </div>

      {/* Mandatory Disclaimer (Section 32 & 34) */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <div className="space-y-1">
          <strong className="font-bold text-sm block">
            Diretriz Profissional Importante (Conteúdo Demonstrativo):
          </strong>
          <p className="leading-relaxed">
            No produto real, não assumir que a personal trainer prescreve dietas. O módulo está preparado para integração de conteúdos elaborados ou validados por nutricionista habilitado, garantindo conformidade com o CFN (Conselho Federal de Nutricionistas).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por aluno, e-mail ou meta..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              options={[
                { value: 'all', label: 'Todos os Objetivos' },
                ...availableGoals.map((g) => ({ value: g, label: g })),
              ]}
              value={currentGoal}
              onChange={(e) => updateParams({ goal: e.target.value, page: '1' })}
            />
          </div>

          <div className="sm:col-span-2">
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

          <div className="sm:col-span-2 flex items-center justify-end gap-2">
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
              {totalItems} {totalItems === 1 ? 'plano' : 'planos'}
            </span>
          </div>
        </div>
      </Card>

      {/* Plans List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : paginatedPlans.length === 0 ? (
        <Card className="py-12 text-center">
          <Apple className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nenhum plano alimentar encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Tente ajustar os filtros de busca ou objetivo para visualizar outros alunos.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedPlans.map((plan) => {
            const student = students[plan.studentId];
            return (
              <Card key={plan.id} className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={student?.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
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
                  <div className="mt-4 space-y-2.5">
                    {plan.meals.slice(0, 3).map((meal) => (
                      <div
                        key={meal.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 text-xs"
                      >
                        <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
                          <span>{meal.name}</span>
                          <span className="text-emerald-500 font-mono">{meal.time}</span>
                        </div>
                        <p className="text-slate-500 truncate">
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

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
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
              </Card>
            );
          })}
        </div>
      )}

      {/* URL-Synchronized Pagination Controls */}
      {!loading && totalPages > 1 && (
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500 dark:text-dark-muted font-mono">
            Exibindo <strong>{startIndex + 1}</strong> a <strong>{endIndex}</strong> de{' '}
            <strong>{totalItems}</strong> planos
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
